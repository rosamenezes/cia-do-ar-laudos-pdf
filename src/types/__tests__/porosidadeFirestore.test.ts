import {
  PorosityMap,
  PorosityMapLegacy,
  PorosityPoint,
  porosityMapDoFirestore,
  porosityMapParaFirestore,
  intradorsoEstaAtivo,
} from '../laudo';

const ponto = (over: Partial<PorosityPoint> = {}): PorosityPoint => ({
  selected: false,
  value: '',
  cor: '',
  ...over,
});

const grade = () => [
  [ponto({ selected: true, value: '210', cor: 'Branco' }), ponto(), ponto(), ponto(), ponto()],
  [ponto(), ponto(), ponto({ selected: true, value: '95', cor: 'Azul' }), ponto(), ponto()],
  [ponto(), ponto(), ponto(), ponto(), ponto()],
];

/** Reproduz a checagem que o Firestore faz antes de aceitar o documento. */
function temArrayAninhado(valor: unknown): boolean {
  if (Array.isArray(valor)) return valor.some((item) => Array.isArray(item));
  if (valor && typeof valor === 'object') return Object.values(valor).some(temArrayAninhado);
  return false;
}

describe('serialização do mapa de porosidade', () => {
  const mapa: PorosityMap = { extradorso: grade(), intradorso: grade(), intradorsoAtivo: true };

  it('não gera array dentro de array (o Firestore recusaria o documento)', () => {
    expect(temArrayAninhado(mapa)).toBe(true);
    expect(temArrayAninhado(porosityMapParaFirestore(mapa))).toBe(false);
  });

  it('devolve a grade original depois da ida e volta', () => {
    expect(porosityMapDoFirestore(porosityMapParaFirestore(mapa) as never)).toEqual(mapa);
  });

  it('trata ausência de porosidade', () => {
    expect(porosityMapParaFirestore(undefined)).toBeUndefined();
    expect(porosityMapDoFirestore(undefined)).toBeUndefined();
    // saveLaudo troca undefined por null antes de gravar
    expect(porosityMapDoFirestore(null)).toBeUndefined();
  });

  it('guarda o intradorso removido, mas marcado como fora do laudo', () => {
    const removido: PorosityMap = {
      extradorso: grade(),
      intradorso: grade(),
      intradorsoAtivo: false,
    };
    const ida = porosityMapParaFirestore(removido) as never;

    expect(porosityMapDoFirestore(ida)).toEqual(removido);
  });

  it('documento antigo, sem a flag, mantém o intradorso que já tinha medição', () => {
    // Gravado antes da opção existir: o laudo tem de continuar saindo igual.
    const antigo = { extradorso: grade(), intradorso: grade() } as never;

    expect(intradorsoEstaAtivo(porosityMapDoFirestore(antigo))).toBe(true);
  });

  it('documento antigo sem nada medido no intradorso já nasce sem ele', () => {
    const vazio = () => [[], [], []];
    const antigo = { extradorso: grade(), intradorso: vazio() } as never;

    expect(intradorsoEstaAtivo(porosityMapDoFirestore(antigo))).toBe(false);
  });

  it('preserva o formato antigo de pontos nomeados', () => {
    const legado: PorosityMapLegacy = {
      extradorso: {
        pontaEsquerda: ponto({ selected: true, value: '180' }),
        meioEsquerda: ponto(),
        meioDireita: ponto(),
        pontaDireita: ponto(),
      },
      intradorso: { esquerda: ponto(), centro: ponto(), direita: ponto() },
    };

    expect(porosityMapParaFirestore(legado)).toEqual(legado);
    expect(porosityMapDoFirestore(legado)).toEqual(legado);
  });
});
