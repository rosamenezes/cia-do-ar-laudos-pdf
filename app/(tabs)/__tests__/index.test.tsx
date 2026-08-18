import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LaudosScreen from '../index';
import * as database from '../../../src/services/database';

jest.mock('../../../src/services/database', () => ({
  getLaudos: jest.fn(),
  seedMockLaudos: jest.fn(),
}));

describe('LaudosScreen (Home)', () => {
  const mockLaudos = [
    {
      id: 'screen-1',
      numeroLaudo: 'LRP-2026-1001',
      dataEmissao: '2026-08-01',
      nomeProprietario: 'Carlos Eduardo',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '11999999999',
      endereco: 'Rua A',
      email: 'carlos@example.com',
      fabricaModelo: 'Ozone Zeno 2',
      numeroSerie: 'OZN-98214',
      dataFabricacao: '2023-04-15',
      corBordoAtaque: 'Rosa',
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
      tecidoPorosidadeBordoAtaque: '280s',
      tecidoPorosidadeIntradorso: '300s',
      tecidoPorosidadeExtradorso: '290s',
      parecerConformeFabricante: 'Sim',
      observacoes: 'Tudo OK',
      parecerGeral: 'OTIMO',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
  ];

  it('deve carregar e renderizar a lista de laudos', async () => {
    (database.getLaudos as jest.Mock).mockResolvedValueOnce(mockLaudos);

    const { getByText } = render(<LaudosScreen />);

    await waitFor(() => {
      expect(getByText('Ozone Zeno 2')).toBeTruthy();
      expect(getByText('Carlos Eduardo')).toBeTruthy();
    });
  });

  it('deve exibir estado vazio quando não houver laudos', async () => {
    (database.getLaudos as jest.Mock).mockResolvedValueOnce([]);

    const { getByText } = render(<LaudosScreen />);

    await waitFor(() => {
      expect(getByText('Nenhum laudo ainda')).toBeTruthy();
    });
  });
});
