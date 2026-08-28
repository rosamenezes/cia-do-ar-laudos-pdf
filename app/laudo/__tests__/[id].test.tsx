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


  const UA_IPHONE =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const UA_ANDROID =
    'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const UA_DESKTOP =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  function montarAparelho({ userAgent, instalado }: { userAgent: string; instalado: boolean }) {
    const print = jest.fn();
    const doc = { write: jest.fn(), close: jest.fn() };
    const open = jest.fn().mockReturnValue({ document: doc });
    const g = globalThis as any;
    g.window = Object.assign(g.window ?? {}, {
      print,
      open,
      matchMedia: () => ({ matches: instalado }),
      navigator: { userAgent, maxTouchPoints: 0 },
    });
    return { print, open, doc };
  }

  async function apertarCompartilhar(getByText: any) {
    await waitFor(() => getByText('Mariana Lima'));
    await act(async () => {
      fireEvent.press(getByText('Gerar PDF (Compartilhar / Salvar)'));
    });
    await waitFor(() => getByText('Compartilhar / Salvar'));
    await act(async () => {
      fireEvent.press(getByText('Compartilhar / Salvar'));
    });
  }

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

  /**
   * O `display-mode: standalone` sozinho não serve para decidir: ele é
   * verdadeiro também no PWA do Android, onde imprimir funciona e abrir aba
   * cai num `about:blank` sem opção de enviar. Só o iPhone instalado é exceção.
   */
  it('deve imprimir no desktop', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);
    const { print, open } = montarAparelho({ userAgent: UA_DESKTOP, instalado: false });

    const { getByText } = render(<LaudoDetailScreen />);
    await apertarCompartilhar(getByText);

    expect(print).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it('deve imprimir no PWA instalado do Android', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);
    const { print, open } = montarAparelho({ userAgent: UA_ANDROID, instalado: true });

    const { getByText } = render(<LaudoDetailScreen />);
    await apertarCompartilhar(getByText);

    expect(print).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it('deve imprimir no Safari em aba, mesmo sendo iPhone', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);
    const { print, open } = montarAparelho({ userAgent: UA_IPHONE, instalado: false });

    const { getByText } = render(<LaudoDetailScreen />);
    await apertarCompartilhar(getByText);

    expect(print).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it('deve abrir o laudo numa aba só no iPhone instalado', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);
    const { print, open, doc } = montarAparelho({ userAgent: UA_IPHONE, instalado: true });

    const { getByText } = render(<LaudoDetailScreen />);
    await apertarCompartilhar(getByText);

    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(doc.write).toHaveBeenCalledWith('<html><body>laudo</body></html>');
    expect(print).not.toHaveBeenCalled();
  });
});
