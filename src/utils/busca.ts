import { LaudoParapente } from '../types/laudo';

/**
 * Minúsculas e sem acento, para que "guacu" encontre "Mogi-Guaçu" e "JOAO"
 * encontre "João" — o técnico digita rápido, sem acentuar.
 */
export function normalizarTexto(texto: string | undefined | null): string {
  const bruto = texto ?? '';
  const semAcento =
    typeof bruto.normalize === 'function'
      ? bruto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : bruto;
  return semAcento.toLowerCase().trim();
}

/** Campos pelos quais se procura um laudo na bancada. */
const CAMPOS_BUSCAVEIS = [
  'nomeProprietario',
  'numeroLaudo',
  'fabricaModelo',
  'numeroSerie',
] as const;

/**
 * Filtra por trecho em qualquer um dos campos buscáveis. Termos separados por
 * espaço são combinados com E, então "ozone 98214" acha a vela certa mesmo com
 * modelo e série vindo de campos diferentes.
 */
export function filtrarLaudos(laudos: LaudoParapente[], termo: string): LaudoParapente[] {
  const pedacos = normalizarTexto(termo).split(/\s+/).filter(Boolean);
  if (pedacos.length === 0) return laudos;

  return laudos.filter((laudo) => {
    const alvo = CAMPOS_BUSCAVEIS.map((campo) => normalizarTexto(laudo[campo])).join(' ');
    return pedacos.every((pedaco) => alvo.includes(pedaco));
  });
}
