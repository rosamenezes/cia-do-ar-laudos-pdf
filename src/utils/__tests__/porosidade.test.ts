import { medicoesDePorosidade } from '../porosidade';
import { PorosityMap, PorosityMapLegacy, PorosityPoint } from '../../types/laudo';

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

describe('medições de porosidade', () => {
  it('lista só os pontos marcados, com coluna e número do ponto', () => {
    const extradorso = gradeVazia();
    extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
    const intradorso = gradeVazia();
    intradorso[2][4] = ponto({ selected: true, value: '40', cor: 'Preto' });

    const mapa: PorosityMap = { extradorso, intradorso, intradorsoAtivo: true };

    expect(medicoesDePorosidade(mapa)).toEqual([
      { local: 'Extradorso · ESQ · Ponto 4', cor: 'Branco', leitura: '210' },
      { local: 'Intradorso · DIR · Ponto 5', cor: 'Preto', leitura: '40' },
    ]);
  });

  it('ignora o intradorso quando ele não foi incluído no laudo', () => {
    const extradorso = gradeVazia();
    extradorso[0][3] = ponto({ selected: true, value: '210', cor: 'Branco' });
    const intradorso = gradeVazia();
    intradorso[2][4] = ponto({ selected: true, value: '40', cor: 'Preto' });

    const mapa: PorosityMap = { extradorso, intradorso, intradorsoAtivo: false };

    expect(medicoesDePorosidade(mapa)).toEqual([
      { local: 'Extradorso · ESQ · Ponto 4', cor: 'Branco', leitura: '210' },
    ]);
  });

  it('sem a flag, laudo antigo continua listando o intradorso medido', () => {
    const intradorso = gradeVazia();
    intradorso[1][1] = ponto({ selected: true, value: '80', cor: 'Cinza' });

    expect(medicoesDePorosidade({ extradorso: gradeVazia(), intradorso })).toEqual([
      { local: 'Intradorso · CENTRO · Ponto 2', cor: 'Cinza', leitura: '80' },
    ]);
  });

  it('marca com travessão o ponto sem cor ou sem leitura', () => {
    const extradorso = gradeVazia();
    extradorso[1][0] = ponto({ selected: true });
    const mapa: PorosityMap = { extradorso, intradorso: gradeVazia() };

    expect(medicoesDePorosidade(mapa)).toEqual([
      { local: 'Extradorso · CENTRO · Ponto 1', cor: '—', leitura: '—' },
    ]);
  });

  it('devolve lista vazia quando não há mapa ou nada foi marcado', () => {
    expect(medicoesDePorosidade(undefined)).toEqual([]);
    expect(
      medicoesDePorosidade({ extradorso: gradeVazia(), intradorso: gradeVazia() })
    ).toEqual([]);
  });

  it('entende o formato antigo de pontos nomeados', () => {
    const legado: PorosityMapLegacy = {
      extradorso: {
        pontaEsquerda: ponto({ selected: true, value: '180', cor: 'Azul' }),
        meioEsquerda: ponto(),
        meioDireita: ponto(),
        pontaDireita: ponto(),
      },
      intradorso: {
        esquerda: ponto(),
        centro: ponto({ selected: true, value: '90', cor: 'Cinza' }),
        direita: ponto(),
      },
    };

    expect(medicoesDePorosidade(legado)).toEqual([
      { local: 'Extradorso · Ponta Esq.', cor: 'Azul', leitura: '180' },
      { local: 'Intradorso · Centro', cor: 'Cinza', leitura: '90' },
    ]);
  });
});
