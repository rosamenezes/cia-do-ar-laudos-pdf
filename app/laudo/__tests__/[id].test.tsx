import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LaudoDetailScreen from '../[id]';
import * as database from '../../../src/services/database';

jest.mock('../../../src/services/database', () => ({
  getLaudoById: jest.fn(),
  deleteLaudo: jest.fn(),
}));

jest.mock('../../../src/services/pdfGenerator', () => ({
  generateAndSavePdf: jest.fn().mockResolvedValue('file:///mock/laudo.pdf'),
  generateAndShare: jest.fn().mockResolvedValue('file:///mock/laudo.pdf'),
}));

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
});
