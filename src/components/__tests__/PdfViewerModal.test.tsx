import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PdfViewerModal } from '../PdfViewerModal';
import { LaudoParapente } from '../../types/laudo';

describe('PdfViewerModal component', () => {
  const mockLaudo: LaudoParapente = {
    id: 'modal-1',
    numeroLaudo: 'LRP-2026-3333',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Lucas Lima',
    cidade: 'Santos',
    estado: 'SP',
    telefone: '(13) 99999-1111',
    endereco: 'Rua B',
    email: 'lucas@example.com',
    fabricaModelo: 'Gin Bonanza',
    numeroSerie: 'GIN-99',
    dataFabricacao: '2021-01-01',
    corBordoAtaque: 'Vermelho',
    corIntradorso: 'Branco',
    corExtradorso: 'Azul',
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
    linhasSimetria: 'Ok',
    linhasSimetriaObs: '',
    linhasTrimagem: 'Ok',
    linhasTrimagemObs: '',
    tecidoCheckPerfil: 'Ok',
    tecidoCheckPerfilObs: '',
    tecidoCheckIntradorso: 'Ok',
    tecidoCheckIntradorsoObs: '',
    tecidoCheckBordoAtaque: 'Ok',
    tecidoCheckBordoAtaqueObs: '',
    tecidoCheckExtradorso: 'Ok',
    tecidoCheckExtradorsoObs: '',
    tecidoTesteResistencia: 'Conforme',
    tecidoPorosidadeBordoAtaque: '200s',
    tecidoPorosidadeIntradorso: '200s',
    tecidoPorosidadeExtradorso: '150s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Tudo OK',
    parecerGeral: 'OTIMO',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve renderizar modal com título e número do laudo', async () => {
    const { getByText } = render(
      <PdfViewerModal visible={true} laudo={mockLaudo} onClose={jest.fn()} onShare={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByText('Visualização do Laudo')).toBeTruthy();
      expect(getByText('LRP-2026-3333')).toBeTruthy();
    });
  });

  it('deve chamar onShare ao clicar no botão Enviar', async () => {
    const onShareMock = jest.fn();
    const { getByText } = render(
      <PdfViewerModal visible={true} laudo={mockLaudo} onClose={jest.fn()} onShare={onShareMock} />
    );

    await waitFor(() => {
      expect(getByText('Enviar')).toBeTruthy();
    });

    fireEvent.press(getByText('Enviar'));
    expect(onShareMock).toHaveBeenCalled();
  });
});
