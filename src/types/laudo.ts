export type StatusCheck = 'Ok' | 'Não Ok';

export type ParecerGeral =
  | 'OTIMO'
  | 'MUITO_BOM'
  | 'USADO_BOM_ESTADO'
  | 'USADO_RAZOAVEL'
  | 'MUITO_USADO'
  | 'CONDENADO';

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
  dataFabricacao: string; // ISO string ou texto (ex: 20/10/2021)
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
  
  linhasSimetriaTrimagem: StatusCheck;
  linhasSimetriaTrimagemObs: string;

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
  tecidoPorosidadeBordoAtaque: string; // Texto livre para "Correto" ou valor
  tecidoPorosidadeIntradorso: string;
  tecidoPorosidadeExtradorso: string;
  
  parecerConformeFabricante: string; // Texto livre (ex: "Correto")
  observacoes: string; // Observações gerais

  // 5. Parecer Geral da Vela
  parecerGeral: ParecerGeral;

  // Foto
  fotoUri?: string; // URI local da foto da identificação visual

  // Metadados de sistema
  criadoEm: string;
  atualizadoEm: string;
  pdfUri?: string; // URI local do PDF gerado
}

export type LaudoFormData = Omit<LaudoParapente, 'id' | 'criadoEm' | 'atualizadoEm' | 'pdfUri'>;
