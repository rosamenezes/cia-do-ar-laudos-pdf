import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LaudoCard } from '../LaudoCard';
import { LaudoParapente } from '../../types/laudo';

describe('LaudoCard component', () => {
  const mockLaudo: LaudoParapente = {
    id: 'laudo-card-1',
    numeroLaudo: 'LRP-2026-7777',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Ana Clara',
    cidade: 'Curitiba',
    estado: 'PR',
    telefone: '(41) 99999-8888',
    endereco: 'Rua das Flores',
    email: 'ana@example.com',
    fabricaModelo: 'Niviuk Artik 6',
    numeroSerie: 'SN-ARTIK-123',
    dataFabricacao: '2022-04-01',
    corBordoAtaque: 'Azul',
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
    tecidoPorosidadeBordoAtaque: '250s',
    tecidoPorosidadeIntradorso: '250s',
    tecidoPorosidadeExtradorso: '300s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Tudo OK',
    parecerGeral: 'OTIMO',
    pdfUri: 'file:///mock/pdf.pdf',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve renderizar dados principais do laudo', () => {
    const { getByText } = render(<LaudoCard laudo={mockLaudo} onPress={jest.fn()} />);

    expect(getByText('LRP-2026-7777')).toBeTruthy();
    expect(getByText('Niviuk Artik 6')).toBeTruthy();
    expect(getByText('Ana Clara')).toBeTruthy();
    expect(getByText('S/N: SN-ARTIK-123')).toBeTruthy();
    expect(getByText('PDF Gerado')).toBeTruthy();
  });

  it('deve chamar onPress ao ser pressionado', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<LaudoCard laudo={mockLaudo} onPress={onPressMock} />);

    fireEvent.press(getByText('Niviuk Artik 6'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
