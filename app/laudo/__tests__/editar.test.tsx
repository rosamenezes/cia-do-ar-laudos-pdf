import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import EditarLaudoScreen from '../[id]/editar';
import * as database from '../../../src/services/database';

jest.mock('../../../src/services/database', () => ({
  getLaudoById: jest.fn(),
  saveLaudo: jest.fn(),
}));

describe('EditarLaudoScreen', () => {
  const mockLaudo = {
    id: '1',
    numeroLaudo: 'LRP-2026-8888',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Lucas Mendes',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    telefone: '(21) 99999-8888',
    endereco: 'Av Copacabana',
    email: 'lucas@example.com',
    fabricaModelo: 'Ozone Delta 4',
    numeroSerie: 'SN-DELTA-4',
    dataFabricacao: '2022-06-01',
    corBordoAtaque: 'Laranja',
    corIntradorso: 'Branco',
    corExtradorso: 'Cinza',
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
    tecidoPorosidadeBordoAtaque: '240s',
    tecidoPorosidadeIntradorso: '240s',
    tecidoPorosidadeExtradorso: '240s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Laudo aprovado',
    parecerGeral: 'MUITO_BOM',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve carregar os dados do laudo no formulário de edição', async () => {
    (database.getLaudoById as jest.Mock).mockResolvedValueOnce(mockLaudo);

    const { getByText } = render(<EditarLaudoScreen />);

    await waitFor(() => {
      expect(getByText('Salvar Alterações')).toBeTruthy();
    });
  });
});
