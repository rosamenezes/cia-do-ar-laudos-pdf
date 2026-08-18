import { generateLaudoHtml } from '../laudoTemplate';
import { LaudoParapente } from '../../types/laudo';

describe('laudoTemplate', () => {
  const mockLaudo: LaudoParapente = {
    id: 'laudo-1',
    numeroLaudo: '2026-001',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'João Silva',
    cidade: 'São Paulo',
    estado: 'SP',
    cidadeEstado: 'São Paulo / SP',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Das Flores, 123',
    email: 'joao@example.com',
    fabricaModelo: 'Sol Paragliders Syrah',
    numeroSerie: 'SN-998877',
    dataFabricacao: '2024-01-15',
    corBordoAtaque: 'Azul',
    corIntradorso: 'Branco',
    corExtradorso: 'Vermelho',
    linhasTirantes: 'Ok',
    linhasTirantesObs: 'Tudo certo',
    linhasBatoquesArgolas: 'Ok',
    linhasBatoquesArgolasObs: '',
    linhasRoldanas: 'Ok',
    linhasRoldanasObs: '',
    linhasDistorcedor: 'Ok',
    linhasDistorcedorObs: '',
    linhasCarga: 'Não Ok',
    linhasCargaObs: 'Ajuste necessário',
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
    tecidoTesteResistencia: 'Correto',
    tecidoPorosidadeBordoAtaque: '250s',
    tecidoPorosidadeExtradorso: '300s',
    parecerConformeFabricante: 'De acordo',
    observacoes: 'Vela em excelente estado de conservação.',
    parecerGeral: 'OTIMO',
    fotoUri: 'file:///mock/foto.jpg',
    criadoEm: '2026-08-03T10:00:00.000Z',
    atualizadoEm: '2026-08-03T10:00:00.000Z',
  };

  it('deve gerar HTML contendo o número do laudo e nome do proprietário', async () => {
    const html = await generateLaudoHtml(mockLaudo);

    expect(html).toContain('Laudo 2026-001');
    expect(html).toContain('João Silva');
    expect(html).toContain('Sol Paragliders Syrah');
    expect(html).toContain('SN-998877');
    expect(html).toContain('Vela em excelente estado de conservação.');
  });

  it('deve formatar corretamente as badges de status Ok e Não Ok', async () => {
    const html = await generateLaudoHtml(mockLaudo);

    expect(html).toContain('✓ Ok');
    expect(html).toContain('✕ Não Ok');
    expect(html).toContain('Obs: Ajuste necessário');
  });

  it('deve gerar HTML mesmo sem fotoUri', async () => {
    const laudoSemFoto = { ...mockLaudo, fotoUri: undefined };
    const html = await generateLaudoHtml(laudoSemFoto);

    expect(html).toContain('João Silva');
    expect(typeof html).toBe('string');
  });
});
