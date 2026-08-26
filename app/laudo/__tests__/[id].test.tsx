import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import LaudoDetailScreen from '../[id]';
import * as database from '../../../src/services/database';

jest.mock('../../../src/services/database', () => ({
  getLaudoById: jest.fn(),
  deleteLaudo: jest.fn(),
}));

jest.mock('../../../src/services/pdfGenerator', () => ({
  generatePdfHtml: jest.fn().mockResolvedValue('<html><body>laudo</body></html>'),
  generatePdfBlob: jest.fn().mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' })),
}));

// A tela injeta o HTML de impressão no body por um portal, que não existe no
// renderer do react-native.
jest.mock('react-dom', () => ({ createPortal: () => null }));

describe('LaudoDetailScreen', () => {
  const mockLaudo = {
    id: 'laudo-detail-1',
    numeroLaudo: 'LRP-2026-5555',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Mariana Lima',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    telefone: '(31) 99999-0000',
    endereco: 'Rua C',
    email: 'mariana@example.com',
    fabricaModelo: 'BGD Cure 2',
    numeroSerie: 'BGD-5555',
    dataFabricacao: '2022-03-01',
    corBordoAtaque: 'Amarelo',
    corIntradorso: 'Branco',
    corExtradorso: 'Preto',
    linhasTirantes: 'Ok',
    linhasTirantesObs: '',
    linhasBatoquesArgolas: 'Ok',
    linhasBatoquesArgolasObs: '',
    linhasRoldanas: 'Ok',
    linhasRoldanasObs: '',
    linhasDistorcedor: 'Ok',
    linhasDistorcedorObs: '',
    linhasCarga: 'Ok',
    linhasCargaObs: '',
    linhasTroca: 'Ok',
    linhasTrocaObs: '',
    linhasSimetriaTrimagem: 'Ok',
    linhasSimetriaTrimagemObs: '',
    tecidoCheckPerfil: 'Ok',
    tecidoCheckPerfilObs: '',
    tecidoCheckIntradorso: 'Ok',
    tecidoCheckIntradorsoObs: '',
    tecidoCheckBordoAtaque: 'Ok',
    tecidoCheckBordoAtaqueObs: '',
    tecidoCheckExtradorso: 'Ok',
    tecidoCheckExtradorsoObs: '',
    tecidoTesteResistencia: 'Conforme',
    tecidoPorosidadeBordoAtaque: '220s',
    tecidoPorosidadeIntradorso: '220s',
    tecidoPorosidadeExtradorso: '220s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Laudo aprovado',
    parecerGeral: 'OTIMO',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve carregar e renderizar os detalhes do laudo', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);

    const { getByText } = render(<LaudoDetailScreen />);

    await waitFor(() => {
      expect(getByText('Mariana Lima')).toBeTruthy();
      expect(getByText('BGD Cure 2')).toBeTruthy();
    });
  });

  it('deve exibir mensagem quando o laudo não for encontrado', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(null);

    const { getByText } = render(<LaudoDetailScreen />);

    await waitFor(() => {
      expect(getByText('Laudo não encontrado')).toBeTruthy();
    });
  });

  it('deve compartilhar o PDF como arquivo em vez de chamar window.print', async () => {
    // No iPhone instalado na tela de início o window.print() é ignorado sem
    // erro: o único caminho que entrega o laudo é a folha nativa.
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);

    const share = jest.fn().mockResolvedValue(undefined);
    const canShare = jest.fn().mockReturnValue(true);
    const print = jest.fn();
    const g = globalThis as any;
    Object.defineProperty(g, 'navigator', {
      value: { ...(g.navigator ?? {}), share, canShare },
      configurable: true,
      writable: true,
    });
    g.window = Object.assign(g.window ?? {}, { print });

    const { getByText } = render(<LaudoDetailScreen />);
    await waitFor(() => getByText('Mariana Lima'));

    await act(async () => {
      fireEvent.press(getByText('Gerar PDF (Compartilhar / Salvar)'));
    });

    // O arquivo é montado enquanto a pré-visualização já está na tela
    await waitFor(() => getByText('Compartilhar / Salvar'));

    await act(async () => {
      fireEvent.press(getByText('Compartilhar / Salvar'));
    });

    expect(share).toHaveBeenCalledTimes(1);
    const enviado = share.mock.calls[0][0];
    expect(enviado.files).toHaveLength(1);
    expect(enviado.files[0].name).toBe('Laudo-LRP-2026-5555.pdf');
    expect(enviado.files[0].type).toBe('application/pdf');
    expect(print).not.toHaveBeenCalled();
  });
});
