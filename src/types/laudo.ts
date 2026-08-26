export type StatusCheck = 'Ok' | 'Não Ok';

/**
 * Classificação do fabricante conforme a leitura do porosímetro (em segundos).
 * Escala oficial afixada na oficina.
 */
export type ParecerPorosimetro =
  | 'NAO_RECOMENDADO'
  | 'MUITO_USADO'
  | 'USADO'
  | 'POUCO_USADO'
  | 'EXCELENTE';

export type ParecerGeral =
  'OTIMO' | 'MUITO_BOM' | 'USADO_BOM_ESTADO' | 'USADO_RAZOAVEL' | 'MUITO_USADO' | 'CONDENADO';

export interface PorosityPoint {
  selected: boolean;
  /** Leitura do porosímetro, em segundos */
  value: string;
  /** Cor do tecido no ponto medido */
  cor: string;
}

/**
 * Grade de medição: 3 colunas (esquerda, centro, direita) e, em cada uma,
 * 5 pontos do bordo de ataque ao bordo de fuga.
 * Indexação: grade[coluna 0..2][ponto 0..4]
 */
export type PorosityGrid = PorosityPoint[][];

export interface PorosityMap {
  extradorso: PorosityGrid;
  intradorso: PorosityGrid;
  /**
   * O intradorso nem sempre é medido. Quando desligado, os pontos continuam
   * guardados (o técnico pode reincluir), mas a superfície não entra no laudo.
   */
  intradorsoAtivo?: boolean;
}

/** Formato anterior à grade 3×5. Mantido para os laudos já emitidos. */
export interface PorosityMapLegacy {
  extradorso: {
    pontaEsquerda: PorosityPoint;
    meioEsquerda: PorosityPoint;
    meioDireita: PorosityPoint;
    pontaDireita: PorosityPoint;
  };
  intradorso: {
    esquerda: PorosityPoint;
    centro: PorosityPoint;
    direita: PorosityPoint;
  };
}

/** Discrimina os dois formatos: a grade nova é um array, a antiga um objeto nomeado. */
export function isPorosityLegacy(
  map: PorosityMap | PorosityMapLegacy | undefined
): map is PorosityMapLegacy {
  return !!map && !Array.isArray((map as PorosityMap).extradorso);
}

/** Há ao menos um ponto marcado na grade? */
function temPontoMarcado(grade: unknown): boolean {
  return (
    Array.isArray(grade) &&
    grade.some((coluna) => Array.isArray(coluna) && coluna.some((ponto) => ponto?.selected))
  );
}

/**
 * O intradorso é opcional. Laudos gravados antes dessa opção não têm a flag:
 * neles vale o que já foi medido, para continuarem saindo como saíam.
 */
export function intradorsoEstaAtivo(map: PorosityMap | PorosityMapLegacy | undefined): boolean {
  if (!map) return false;
  if (isPorosityLegacy(map)) {
    return Object.values(map.intradorso ?? {}).some((ponto) => ponto?.selected);
  }
  if (typeof map.intradorsoAtivo === 'boolean') return map.intradorsoAtivo;
  return temPontoMarcado(map.intradorso);
}

/**
 * Grade como ela é gravada no Firestore. O banco não aceita array dentro de
 * array, então cada coluna vira um objeto que embrulha a lista de pontos.
 */
export interface PorosityColunaStored {
  pontos: PorosityPoint[];
}
export type PorosityGridStored = PorosityColunaStored[];

export interface PorosityMapStored {
  extradorso: PorosityGridStored;
  intradorso: PorosityGridStored;
  intradorsoAtivo?: boolean;
}

/** Uma coluna gravada é `{ pontos: [...] }`; a mesma coluna em memória é um array. */
function isColunaStored(coluna: unknown): coluna is PorosityColunaStored {
  return (
    !!coluna && !Array.isArray(coluna) && Array.isArray((coluna as PorosityColunaStored).pontos)
  );
}

function gridParaFirestore(grade: PorosityGrid | undefined): PorosityGridStored {
  if (!Array.isArray(grade)) return [];
  return grade.map((coluna) => ({ pontos: Array.isArray(coluna) ? coluna : [] }));
}

function gridDoFirestore(grade: unknown): PorosityGrid {
  if (!Array.isArray(grade)) return [];
  return grade.map((coluna) => {
    if (isColunaStored(coluna)) return coluna.pontos;
    // Grade que nunca passou pelo banco (ou veio de um mock em memória).
    return Array.isArray(coluna) ? (coluna as PorosityPoint[]) : [];
  });
}

/**
 * Prepara o mapa de porosidade para o `setDoc`. O formato antigo já é um objeto
 * de campos nomeados, aceito pelo Firestore como está.
 */
export function porosityMapParaFirestore(
  map: PorosityMap | PorosityMapLegacy | undefined
): PorosityMapStored | PorosityMapLegacy | undefined {
  if (!map) return undefined;
  if (isPorosityLegacy(map)) return map;
  return {
    extradorso: gridParaFirestore(map.extradorso),
    intradorso: gridParaFirestore(map.intradorso),
    intradorsoAtivo: intradorsoEstaAtivo(map),
  };
}

/** Desfaz o embrulho feito na gravação, devolvendo a grade 3×5 que a UI espera. */
export function porosityMapDoFirestore(
  map: PorosityMapStored | PorosityMap | PorosityMapLegacy | undefined | null
): PorosityMap | PorosityMapLegacy | undefined {
  if (!map) return undefined;
  if (isPorosityLegacy(map as PorosityMap | PorosityMapLegacy)) return map as PorosityMapLegacy;
  const bruto = map as PorosityMapStored | PorosityMap;
  const intradorso = gridDoFirestore(bruto.intradorso);
  return {
    extradorso: gridDoFirestore(bruto.extradorso),
    intradorso,
    // Documento antigo não tem a flag: nesse caso ela vem do que já foi medido.
    intradorsoAtivo:
      typeof bruto.intradorsoAtivo === 'boolean'
        ? bruto.intradorsoAtivo
        : temPontoMarcado(intradorso),
  };
}

/** Foto extra do equipamento: rasgo, remendo, reparo, costura refeita... */
export interface FotoAdicional {
  uri: string;
  descricao: string;
}

export interface LaudoParapente {
  id: string;
  // Metadados do Laudo
  numeroLaudo: string;
  dataEmissao: string; // ISO string

  // 1. Proprietário
  nomeProprietario: string;
  cidade: string;
  estado: string;
  cidadeEstado?: string;
  telefone: string;
  endereco: string;
  email: string;

  // 2. Identificação da Vela
  fabricaModelo: string;
  numeroSerie: string;
  dataFabricacao: string; // Mês/ano no formato AAAA-MM (laudos antigos podem ter AAAA-MM-DD)
  corBordoAtaque: string;
  corIntradorso: string;
  corExtradorso: string;

  // 3. Checagem de Linhas
  linhasTirantes: StatusCheck;
  linhasTirantesObs: string;

  linhasBatoquesArgolas: StatusCheck;
  linhasBatoquesArgolasObs: string;

  linhasRoldanas: StatusCheck;
  linhasRoldanasObs: string;

  linhasDistorcedor: StatusCheck;
  linhasDistorcedorObs: string;

  linhasCarga: StatusCheck;
  linhasCargaObs: string;

  linhasTroca: StatusCheck;
  linhasTrocaObs: string;

  linhasSimetria: StatusCheck;
  linhasSimetriaObs: string;
  linhasTrimagem: StatusCheck;
  linhasTrimagemObs: string;

  // 4. Checagem do Tecido
  tecidoCheckPerfil: StatusCheck;
  tecidoCheckPerfilObs: string;

  tecidoCheckIntradorso: StatusCheck;
  tecidoCheckIntradorsoObs: string;

  tecidoCheckBordoAtaque: StatusCheck;
  tecidoCheckBordoAtaqueObs: string;

  tecidoCheckExtradorso: StatusCheck;
  tecidoCheckExtradorsoObs: string;

  tecidoTesteResistencia: string; // Texto livre para "Correto" ou valor
  tecidoPorosidadeBordoAtaque?: string; // (Depreciado)
  tecidoPorosidadeExtradorso?: string; // (Depreciado)

  parecerConformeFabricante: string; // ParecerPorosimetro nos laudos novos; texto livre nos antigos
  observacoes: string; // Observações gerais

  // Mapa de Porosidade (Novo Formato Visual)
  porosidade?: PorosityMap | PorosityMapLegacy;

  // 5. Parecer Geral da Vela
  parecerGeral: ParecerGeral;

  // Fotos
  fotoUri?: string; // Foto principal da vela
  fotoSeloUri?: string; // Foto do selo de informações da vela
  fotosAdicionais?: FotoAdicional[]; // Rasgos, remendos e reparos

  // Metadados de sistema
  criadoEm: string;
  atualizadoEm: string;
  pdfUri?: string; // URI local do PDF gerado
}

export type LaudoFormData = Omit<LaudoParapente, 'id' | 'criadoEm' | 'atualizadoEm' | 'pdfUri'>;
