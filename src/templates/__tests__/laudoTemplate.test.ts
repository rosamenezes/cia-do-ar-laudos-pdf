import { generateLaudoHtml } from '../laudoTemplate';
import { LaudoParapente, PorosityMap, PorosityMapLegacy, PorosityPoint } from '../../types/laudo';
import { POROSIDADE_VELA_PATH } from '../../types/constants';

const ponto = (over: Partial<PorosityPoint> = {}): PorosityPoint => ({
  selected: false,
  value: '',
  cor: '',
  ...over,
});

const gradeVazia = () => [
  [ponto(), ponto(), ponto(), ponto(), ponto()],
  [ponto(), ponto(), ponto(), ponto(), ponto()],
  [ponto(), ponto(), ponto(), ponto(), ponto()],
];

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

    expect(html).toContain('Laudo Nº');
    expect(html).toContain('2026-001');
    expect(html).toContain('João Silva');
    expect(html).toContain('Sol Paragliders Syrah');
    expect(html).toContain('SN-998877');
    expect(html).toContain('Vela em excelente estado de conservação.');
  });

  it('deve formatar corretamente as badges de status Ok e Não Ok', async () => {
    const html = await generateLaudoHtml(mockLaudo);

    // "Ok" sai como badge com texto; "Não Ok" sai só como o ✕ vermelho.
    expect(html).toContain('✓ Ok');
    expect(html).toContain('✕');
    expect(html).toContain('Obs: Ajuste necessário');
  });

  describe('medição de porosidade', () => {
    // Laudo gravado antes da opção de remover o intradorso: sem a flag, vale o
    // que já foi medido, para ele continuar saindo exatamente como saía.
    it('desenha as duas velas e lista os pontos marcados', async () => {
      const extradorso = gradeVazia();
      extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
      const intradorso = gradeVazia();
      intradorso[1][0] = ponto({ selected: true, value: '150', cor: 'Cinza' });
      const porosidade: PorosityMap = { extradorso, intradorso };

      const html = await generateLaudoHtml({ ...mockLaudo, porosidade });

      expect(html).toContain('MEDIÇÃO DE POROSIDADE');
      // O contorno impresso tem de ser o mesmo que o técnico vê na tela.
      expect(html).toContain(POROSIDADE_VELA_PATH);
      expect(html).toContain('EXTRADORSO');
      expect(html).toContain('INTRADORSO');

      expect(html).toContain('Extradorso · ESQ · Ponto 4');
      expect(html).toContain('Branco');
      expect(html).toContain('210');
      expect(html).toContain('Intradorso · CENTRO · Ponto 1');
      expect(html).toContain('Cinza');
      expect(html).toContain('150');
    });

    it('sai só com o extradorso quando o intradorso não foi incluído', async () => {
      const extradorso = gradeVazia();
      extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
      // Pontos do intradorso existem de uma inclusão anterior, mas foi removido:
      // nem o desenho nem a tabela podem trazê-lo de volta ao laudo.
      const intradorso = gradeVazia();
      intradorso[1][0] = ponto({ selected: true, value: '150', cor: 'Cinza' });
      const porosidade: PorosityMap = { extradorso, intradorso, intradorsoAtivo: false };

      const html = await generateLaudoHtml({ ...mockLaudo, porosidade });

      expect(html).toContain('EXTRADORSO');
      expect(html).not.toContain('INTRADORSO');
      // Um único desenho de vela na folha.
      expect(html.split(POROSIDADE_VELA_PATH)).toHaveLength(2);

      expect(html).toContain('Extradorso · ESQ · Ponto 4');
      expect(html).not.toContain('Intradorso · CENTRO · Ponto 1');
      expect(html).not.toContain('Cinza');
    });

    it('omite a seção quando só o intradorso removido tinha pontos', async () => {
      const intradorso = gradeVazia();
      intradorso[1][0] = ponto({ selected: true, value: '150', cor: 'Cinza' });

      const html = await generateLaudoHtml({
        ...mockLaudo,
        porosidade: { extradorso: gradeVazia(), intradorso, intradorsoAtivo: false },
      });

      expect(html).not.toContain('MEDIÇÃO DE POROSIDADE');
    });

    it('desenha as duas velas quando o intradorso foi incluído', async () => {
      const extradorso = gradeVazia();
      extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
      const intradorso = gradeVazia();
      intradorso[1][0] = ponto({ selected: true, value: '150', cor: 'Cinza' });

      const html = await generateLaudoHtml({
        ...mockLaudo,
        porosidade: { extradorso, intradorso, intradorsoAtivo: true },
      });

      expect(html).toContain('INTRADORSO');
      expect(html.split(POROSIDADE_VELA_PATH)).toHaveLength(3);
      expect(html).toContain('Intradorso · CENTRO · Ponto 1');
    });

    it('desenha só os pontos medidos, sem os vazios', async () => {
      const extradorso = gradeVazia();
      extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
      extradorso[2][0] = ponto({ selected: true, value: '95', cor: 'Azul' });
      const porosidade: PorosityMap = { extradorso, intradorso: gradeVazia() };

      const html = await generateLaudoHtml({ ...mockLaudo, porosidade });

      // 2 medidos de 30 possíveis: os outros 28 não entram no impresso.
      expect(html.match(/fill="#dc2626"/g)).toHaveLength(2);
      expect(html.match(/stroke="#94a3b8"/g)).toBeNull();
    });

    it('omite a seção quando nenhum ponto foi marcado', async () => {
      const html = await generateLaudoHtml({
        ...mockLaudo,
        porosidade: { extradorso: gradeVazia(), intradorso: gradeVazia() },
      });

      expect(html).not.toContain('MEDIÇÃO DE POROSIDADE');
    });

    it('ainda imprime os laudos no formato antigo de pontos nomeados', async () => {
      const legado: PorosityMapLegacy = {
        extradorso: {
          pontaEsquerda: ponto({ selected: true, value: '180' }),
          meioEsquerda: ponto(),
          meioDireita: ponto(),
          pontaDireita: ponto(),
        },
        intradorso: { esquerda: ponto(), centro: ponto(), direita: ponto() },
      };

      const html = await generateLaudoHtml({ ...mockLaudo, porosidade: legado });

      expect(html).toContain('MEDIÇÃO DE POROSIDADE');
      expect(html).toContain('Extradorso: Ponta Esq.');
      expect(html).toContain('180');
    });
  });

  it('deve gerar HTML mesmo sem fotoUri', async () => {
    const laudoSemFoto = { ...mockLaudo, fotoUri: undefined };
    const html = await generateLaudoHtml(laudoSemFoto);

    expect(html).toContain('João Silva');
    expect(typeof html).toBe('string');
  });
});
