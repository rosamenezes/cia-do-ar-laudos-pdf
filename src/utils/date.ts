/**
 * Formatação de datas no padrão brasileiro.
 *
 * Os laudos guardam datas em formato ISO ('2026-08-24' para dia completo,
 * '2023-04' para mês/ano), mas laudos antigos podem ter texto livre
 * ('20/10/2021'). As funções abaixo aceitam os três casos.
 */

/** Data completa no padrão brasileiro: DD/MM/AAAA */
export function formatDateBR(value?: string): string {
  if (!value) return '';

  const isoFull = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoFull) return `${isoFull[3]}/${isoFull[2]}/${isoFull[1]}`;

  const isoMonth = value.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) return `${isoMonth[2]}/${isoMonth[1]}`;

  return value; // já veio digitado pelo inspetor
}

/** Apenas mês e ano: MM/AAAA */
export function formatMonthYearBR(value?: string): string {
  if (!value) return '';

  const iso = value.match(/^(\d{4})-(\d{2})/); // cobre AAAA-MM e AAAA-MM-DD
  if (iso) return `${iso[2]}/${iso[1]}`;

  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // legado DD/MM/AAAA
  if (br) return `${br[2]}/${br[3]}`;

  return value;
}

/** Normaliza para AAAA-MM, que é o valor esperado por <input type="month"> */
export function toMonthValue(value?: string): string {
  if (!value) return '';

  const iso = value.match(/^(\d{4})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}`;

  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}`;

  return '';
}
