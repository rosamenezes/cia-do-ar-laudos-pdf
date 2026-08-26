import {
  PorosityMap,
  PorosityMapLegacy,
  PorosityPoint,
  isPorosityLegacy,
  intradorsoEstaAtivo,
} from '../types/laudo';
import { POROSIDADE_COLUNAS } from '../types/constants';

/** Um ponto efetivamente marcado na vela, pronto para exibição. */
export interface MedicaoPorosidade {
  /** Ex.: "Extradorso · CENTRO · Ponto 3" */
  local: string;
  cor: string;
  leitura: string;
}

/** Rótulos dos pontos nomeados usados antes da grade 3×5. */
const ROTULOS_LEGADO: Record<'extradorso' | 'intradorso', Record<string, string>> = {
  extradorso: {
    pontaEsquerda: 'Ponta Esq.',
    meioEsquerda: 'Meio Esq.',
    meioDireita: 'Meio Dir.',
    pontaDireita: 'Ponta Dir.',
  },
  intradorso: {
    esquerda: 'Esquerda',
    centro: 'Centro',
    direita: 'Direita',
  },
};

const SUPERFICIES = ['extradorso', 'intradorso'] as const;

function rotularSuperficie(superficie: (typeof SUPERFICIES)[number]): string {
  return superficie === 'extradorso' ? 'Extradorso' : 'Intradorso';
}

function medir(ponto: PorosityPoint | undefined, local: string): MedicaoPorosidade | null {
  if (!ponto?.selected) return null;
  return { local, cor: ponto.cor || '—', leitura: ponto.value || '—' };
}

/**
 * Lista só os pontos marcados, na ordem em que aparecem na vela, aceitando tanto
 * a grade 3×5 quanto o formato antigo de pontos nomeados.
 */
export function medicoesDePorosidade(
  map: PorosityMap | PorosityMapLegacy | undefined
): MedicaoPorosidade[] {
  if (!map) return [];

  const medicoes: MedicaoPorosidade[] = [];

  // Intradorso desligado não é medição: os pontos podem existir de uma inclusão
  // anterior, mas não entram nem na tela nem no laudo.
  const superficies = intradorsoEstaAtivo(map)
    ? SUPERFICIES
    : SUPERFICIES.filter((s) => s !== 'intradorso');

  if (isPorosityLegacy(map)) {
    superficies.forEach((superficie) => {
      const pontos = (map[superficie] ?? {}) as Record<string, PorosityPoint>;
      Object.entries(pontos).forEach(([chave, ponto]) => {
        const rotulo = ROTULOS_LEGADO[superficie][chave] ?? chave;
        const medicao = medir(ponto, `${rotularSuperficie(superficie)} · ${rotulo}`);
        if (medicao) medicoes.push(medicao);
      });
    });
    return medicoes;
  }

  superficies.forEach((superficie) => {
    const grade = Array.isArray(map[superficie]) ? map[superficie] : [];
    grade.forEach((coluna, c) => {
      (Array.isArray(coluna) ? coluna : []).forEach((ponto, i) => {
        const local = `${rotularSuperficie(superficie)} · ${POROSIDADE_COLUNAS[c] ?? c + 1} · Ponto ${i + 1}`;
        const medicao = medir(ponto, local);
        if (medicao) medicoes.push(medicao);
      });
    });
  });

  return medicoes;
}
