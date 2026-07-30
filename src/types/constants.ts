import { ParecerGeral, StatusCheck } from './laudo';

export const STATUS_CHECK_OPTIONS: [StatusCheck, string][] = [
  ['Ok', 'Ok'],
  ['Não Ok', 'Não Ok'],
];

export const PARECER_GERAL_LABELS: Record<ParecerGeral, string> = {
  OTIMO: 'Ótimo estado - Revisar a cada 100h ou 1 ano',
  MUITO_BOM: 'Muito bom - Revisar a cada 100h ou 1 ano',
  USADO_BOM_ESTADO: 'Usado, bom estado - Revisar a cada 100h ou 1 ano',
  USADO_RAZOAVEL: 'Usado, razoável estado - Revisar a cada 50h ou 6 meses',
  MUITO_USADO: 'Muito usado - Revisar a cada 50h ou 6 meses',
  CONDENADO: 'Não aconselhado voar - Equipamento condenado',
};

export const PARECER_GERAL_SHORT_LABELS: Record<ParecerGeral, string> = {
  OTIMO: 'Ótimo estado',
  MUITO_BOM: 'Muito bom',
  USADO_BOM_ESTADO: 'Usado, bom estado',
  USADO_RAZOAVEL: 'Usado, razoável estado',
  MUITO_USADO: 'Muito usado',
  CONDENADO: 'Equipamento condenado',
};

export const PARECER_GERAL_COLORS: Record<ParecerGeral, string> = {
  OTIMO: '#16a34a', // Verde forte
  MUITO_BOM: '#22c55e', // Verde padrão
  USADO_BOM_ESTADO: '#84cc16', // Verde amarelado
  USADO_RAZOAVEL: '#f59e0b', // Amarelo/Laranja
  MUITO_USADO: '#f97316', // Laranja escuro
  CONDENADO: '#dc2626', // Vermelho forte
};

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type EstadoBrasil = (typeof ESTADOS_BRASIL)[number];
