import { ParecerGeral, ParecerPorosimetro, StatusCheck } from './laudo';

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

/**
 * Escala do porosímetro (leitura em segundos).
 * Fonte: tabela oficial do fabricante afixada na oficina.
 */
export const PARECER_POROSIMETRO_LABELS: Record<ParecerPorosimetro, string> = {
  NAO_RECOMENDADO: '0" – 5" · Não recomendamos usar, risco de parachutagem!',
  MUITO_USADO: '6" – 25" · Muito usado, mas ainda voável',
  USADO: '26" – 80" · Usado, voável',
  POUCO_USADO: '81" – 200" · Pouco usado, semi-novo',
  EXCELENTE: '+200" · Excelente, novo',
};

/** Só a faixa, para colunas de tabela */
export const PARECER_POROSIMETRO_FAIXAS: Record<ParecerPorosimetro, string> = {
  NAO_RECOMENDADO: '0" – 5"',
  MUITO_USADO: '6" – 25"',
  USADO: '26" – 80"',
  POUCO_USADO: '81" – 200"',
  EXCELENTE: '+200"',
};

/** Só o veredito, sem a faixa */
export const PARECER_POROSIMETRO_SHORT_LABELS: Record<ParecerPorosimetro, string> = {
  NAO_RECOMENDADO: 'Não recomendamos usar, risco de parachutagem!',
  MUITO_USADO: 'Muito usado, mas ainda voável',
  USADO: 'Usado, voável',
  POUCO_USADO: 'Pouco usado, semi-novo',
  EXCELENTE: 'Excelente, novo',
};

export const PARECER_POROSIMETRO_COLORS: Record<ParecerPorosimetro, string> = {
  NAO_RECOMENDADO: '#dc2626',
  MUITO_USADO: '#f97316',
  USADO: '#f59e0b',
  POUCO_USADO: '#84cc16',
  EXCELENTE: '#16a34a',
};

/** Colunas da grade de porosidade, da esquerda para a direita da vela. */
export const POROSIDADE_COLUNAS = ['ESQ', 'CENTRO', 'DIR'] as const;

/** Pontos por coluna, do bordo de ataque ao bordo de fuga. */
export const POROSIDADE_PONTOS_POR_COLUNA = 5;

/**
 * Geometria do desenho da vela, num viewBox de 400 de largura. A tela e o PDF
 * leem daqui para que o laudo impresso bata com o que o técnico marcou no app.
 */
export const POROSIDADE_COLUNA_X = [100, 200, 300];

/**
 * Altura dos 5 pontos em cada coluna, do bordo de ataque ao de fuga. O centro
 * tem seu próprio intervalo porque a asa é mais alta ali: repetir as mesmas
 * alturas jogaria os pontos de cima para fora do contorno.
 */
export const POROSIDADE_PONTO_Y = [
  [70, 85, 100, 115, 130], // ESQ
  [63, 80, 96, 113, 130], // CENTRO
  [70, 85, 100, 115, 130], // DIR
];

/**
 * Contorno da vela como na ficha de oficina: bordo de fuga reto embaixo,
 * laterais retas na vertical, ombros arredondados e o bordo de ataque num
 * arco único, mais alto no centro.
 */
export const POROSIDADE_VELA_PATH =
  'M 20 140 L 20 84 Q 20 77 26 75.4 Q 200 33 374 75.4 Q 380 77 380 84 L 380 140 Z';

export const ESTADOS_BRASIL = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type EstadoBrasil = (typeof ESTADOS_BRASIL)[number];
