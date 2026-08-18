import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LaudoForm } from '../LaudoForm';

describe('LaudoForm component', () => {
  const initialValues = {
    numeroLaudo: 'LRP-2026-1000',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Carlos Eduardo',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 99999-9999',
    endereco: 'Rua A',
    email: 'carlos@example.com',
    fabricaModelo: 'Sol Syrah',
    numeroSerie: 'SN-001',
    dataFabricacao: '2022-01-01',
    corBordoAtaque: 'Azul',
    corIntradorso: 'Branco',
    corExtradorso: 'Preto',
    linhasTirantes: 'Ok' as const,
    linhasTirantesObs: '',
    linhasBatoquesArgolas: 'Ok' as const,
    linhasBatoquesArgolasObs: '',
    linhasRoldanas: 'Ok' as const,
    linhasRoldanasObs: '',
    linhasDistorcedor: 'Ok' as const,
    linhasDistorcedorObs: '',
    linhasCarga: 'Ok' as const,
    linhasCargaObs: '',
    linhasTroca: 'Ok' as const,
    linhasTrocaObs: '',
    linhasSimetria: 'Ok' as const,
    linhasSimetriaObs: '',
    linhasTrimagem: 'Ok' as const,
    linhasTrimagemObs: '',
    tecidoCheckPerfil: 'Ok' as const,
    tecidoCheckPerfilObs: '',
    tecidoCheckIntradorso: 'Ok' as const,
    tecidoCheckIntradorsoObs: '',
    tecidoCheckBordoAtaque: 'Ok' as const,
    tecidoCheckBordoAtaqueObs: '',
    tecidoCheckExtradorso: 'Ok' as const,
    tecidoCheckExtradorsoObs: '',
    tecidoTesteResistencia: 'Conforme',
    tecidoPorosidadeBordoAtaque: '250s',
    tecidoPorosidadeExtradorso: '300s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Sem observações',
    parecerGeral: 'OTIMO' as const,
  };

  it('deve renderizar as seções do formulário', () => {
    const { getByText } = render(<LaudoForm defaultValues={initialValues} onSubmit={jest.fn()} />);

    expect(getByText('1. Dados do Proprietário')).toBeTruthy();
    expect(getByText('2. Identificação da Vela')).toBeTruthy();
    expect(getByText('3. Identificação Visual (Foto)')).toBeTruthy();
    expect(getByText('4. Checagem de Linhas')).toBeTruthy();
    expect(getByText('5. Checagem do Tecido')).toBeTruthy();
    expect(getByText('6. Parecer Geral da Vela')).toBeTruthy();
  });

  it('deve submeter o formulário com dados válidos ao clicar em Salvar', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <LaudoForm defaultValues={initialValues} onSubmit={onSubmitMock} submitLabel="Salvar Laudo" />
    );

    fireEvent.press(getByText('Salvar Laudo'));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalled();
    });
  });
});
