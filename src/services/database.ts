import * as SQLite from 'expo-sqlite';
import { LaudoParapente } from '../types/laudo';

const DB_NAME = 'laudos_v1.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS laudos_parapente (
      id TEXT PRIMARY KEY NOT NULL,
      numeroLaudo TEXT NOT NULL,
      dataEmissao TEXT NOT NULL,
      
      nomeProprietario TEXT NOT NULL,
      cidade TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT '',
      cidadeEstado TEXT NOT NULL DEFAULT '',
      telefone TEXT NOT NULL,
      endereco TEXT NOT NULL,
      email TEXT NOT NULL,

      fabricaModelo TEXT NOT NULL,
      numeroSerie TEXT NOT NULL,
      dataFabricacao TEXT NOT NULL,
      corBordoAtaque TEXT NOT NULL,
      corIntradorso TEXT NOT NULL,
      corExtradorso TEXT NOT NULL,

      linhasTirantes TEXT NOT NULL,
      linhasTirantesObs TEXT NOT NULL,
      linhasBatoquesArgolas TEXT NOT NULL,
      linhasBatoquesArgolasObs TEXT NOT NULL,
      linhasRoldanas TEXT NOT NULL,
      linhasRoldanasObs TEXT NOT NULL,
      linhasDistorcedor TEXT NOT NULL,
      linhasDistorcedorObs TEXT NOT NULL,
      linhasCarga TEXT NOT NULL,
      linhasCargaObs TEXT NOT NULL,
      linhasTroca TEXT NOT NULL,
      linhasTrocaObs TEXT NOT NULL,
      linhasSimetriaTrimagem TEXT NOT NULL,
      linhasSimetriaTrimagemObs TEXT NOT NULL,
      linhasSimetria TEXT NOT NULL DEFAULT '',
      linhasSimetriaObs TEXT NOT NULL DEFAULT '',
      linhasTrimagem TEXT NOT NULL DEFAULT '',
      linhasTrimagemObs TEXT NOT NULL DEFAULT '',

      tecidoCheckPerfil TEXT NOT NULL,
      tecidoCheckPerfilObs TEXT NOT NULL,
      tecidoCheckIntradorso TEXT NOT NULL,
      tecidoCheckIntradorsoObs TEXT NOT NULL,
      tecidoCheckBordoAtaque TEXT NOT NULL,
      tecidoCheckBordoAtaqueObs TEXT NOT NULL,
      tecidoCheckExtradorso TEXT NOT NULL,
      tecidoCheckExtradorsoObs TEXT NOT NULL,
      
      tecidoTesteResistencia TEXT NOT NULL,
      tecidoPorosidadeBordoAtaque TEXT NOT NULL,
      tecidoPorosidadeIntradorso TEXT NOT NULL,
      tecidoPorosidadeExtradorso TEXT NOT NULL,
      
      parecerConformeFabricante TEXT NOT NULL,
      observacoes TEXT NOT NULL,

      parecerGeral TEXT NOT NULL,

      fotoUri TEXT,
      criadoEm TEXT NOT NULL,
      atualizadoEm TEXT NOT NULL,
      pdfUri TEXT
    );
  `);

  // Migrações automáticas para garantir que colunas novas existam em bancos já criados
  try {
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN cidade TEXT NOT NULL DEFAULT '';`);
  } catch {}

  try {
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN estado TEXT NOT NULL DEFAULT '';`);
  } catch {}

  try {
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN linhasSimetria TEXT NOT NULL DEFAULT '';`);
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN linhasSimetriaObs TEXT NOT NULL DEFAULT '';`);
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN linhasTrimagem TEXT NOT NULL DEFAULT '';`);
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN linhasTrimagemObs TEXT NOT NULL DEFAULT '';`);
  } catch {}
}

export async function saveLaudo(laudo: LaudoParapente): Promise<void> {
  const db = await getDatabase();
  const cidadeVal = laudo.cidade ?? '';
  const estadoVal = laudo.estado ?? '';
  const cidadeEstadoVal = `${cidadeVal} - ${estadoVal}`;

  await db.runAsync(
    `INSERT OR REPLACE INTO laudos_parapente (
      id, numeroLaudo, dataEmissao,
      nomeProprietario, cidade, estado, cidadeEstado, telefone, endereco, email,
      fabricaModelo, numeroSerie, dataFabricacao, corBordoAtaque, corIntradorso, corExtradorso,
      linhasTirantes, linhasTirantesObs, linhasBatoquesArgolas, linhasBatoquesArgolasObs, linhasRoldanas, linhasRoldanasObs,
      linhasDistorcedor, linhasDistorcedorObs, linhasCarga, linhasCargaObs, linhasTroca, linhasTrocaObs, linhasSimetriaTrimagem, linhasSimetriaTrimagemObs, linhasSimetria, linhasSimetriaObs, linhasTrimagem, linhasTrimagemObs,
      tecidoCheckPerfil, tecidoCheckPerfilObs, tecidoCheckIntradorso, tecidoCheckIntradorsoObs,
      tecidoCheckBordoAtaque, tecidoCheckBordoAtaqueObs, tecidoCheckExtradorso, tecidoCheckExtradorsoObs,
      tecidoTesteResistencia, tecidoPorosidadeBordoAtaque, tecidoPorosidadeIntradorso, tecidoPorosidadeExtradorso,
      parecerConformeFabricante, observacoes,
      parecerGeral, fotoUri,
      criadoEm, atualizadoEm, pdfUri
    ) VALUES (
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?
    )`,
    [
      laudo.id,
      laudo.numeroLaudo,
      laudo.dataEmissao,
      laudo.nomeProprietario,
      cidadeVal,
      estadoVal,
      cidadeEstadoVal,
      laudo.telefone,
      laudo.endereco,
      laudo.email,
      laudo.fabricaModelo,
      laudo.numeroSerie,
      laudo.dataFabricacao,
      laudo.corBordoAtaque,
      laudo.corIntradorso,
      laudo.corExtradorso,
      laudo.linhasTirantes,
      laudo.linhasTirantesObs,
      laudo.linhasBatoquesArgolas,
      laudo.linhasBatoquesArgolasObs,
      laudo.linhasRoldanas,
      laudo.linhasRoldanasObs,
      laudo.linhasDistorcedor,
      laudo.linhasDistorcedorObs,
      laudo.linhasCarga,
      laudo.linhasCargaObs,
      laudo.linhasTroca,
      laudo.linhasTrocaObs,
      '',
      '',
      laudo.linhasSimetria,
      laudo.linhasSimetriaObs,
      laudo.linhasTrimagem,
      laudo.linhasTrimagemObs,
      laudo.tecidoCheckPerfil,
      laudo.tecidoCheckPerfilObs,
      laudo.tecidoCheckIntradorso,
      laudo.tecidoCheckIntradorsoObs,
      laudo.tecidoCheckBordoAtaque,
      laudo.tecidoCheckBordoAtaqueObs,
      laudo.tecidoCheckExtradorso,
      laudo.tecidoCheckExtradorsoObs,
      laudo.tecidoTesteResistencia,
      laudo.tecidoPorosidadeBordoAtaque,
      '',
      laudo.tecidoPorosidadeExtradorso,
      laudo.parecerConformeFabricante,
      laudo.observacoes,
      laudo.parecerGeral,
      laudo.fotoUri ?? null,
      laudo.criadoEm,
      laudo.atualizadoEm,
      laudo.pdfUri ?? null,
    ]
  );
}

export async function getLaudos(): Promise<LaudoParapente[]> {
  const db = await getDatabase();
  let rows = await db.getAllAsync<LaudoParapente>(
    'SELECT * FROM laudos_parapente ORDER BY criadoEm DESC'
  );
  if (rows.length === 0) {
    await seedMockLaudos();
    rows = await db.getAllAsync<LaudoParapente>(
      'SELECT * FROM laudos_parapente ORDER BY criadoEm DESC'
    );
  }
  return rows;
}

export async function getLaudoById(id: string): Promise<LaudoParapente | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<LaudoParapente>(
    'SELECT * FROM laudos_parapente WHERE id = ?',
    [id]
  );
  return row ?? null;
}

export async function deleteLaudo(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM laudos_parapente WHERE id = ?', [id]);
}

export async function updatePdfUri(id: string, pdfUri: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE laudos_parapente SET pdfUri = ?, atualizadoEm = ? WHERE id = ?', [
    pdfUri,
    new Date().toISOString(),
    id,
  ]);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateNumeroLaudo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `LRP-${year}-${seq}`; // LRP = Laudo Revisão Parapente
}

export async function seedMockLaudos(): Promise<void> {
  const mockLaudos: LaudoParapente[] = [
    {
      id: 'mock-1001',
      numeroLaudo: 'LRP-2026-8812',
      dataEmissao: '2026-08-01',
      nomeProprietario: 'Carlos Eduardo Silva',
      cidade: 'São Paulo',
      estado: 'SP',
      cidadeEstado: 'São Paulo - SP',
      telefone: '(11) 98765-4321',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      email: 'carlos.silva@email.com',
      fabricaModelo: 'Ozone Zeno 2',
      numeroSerie: 'OZN-98214',
      dataFabricacao: '2023-04-15',
      corBordoAtaque: 'Rosa Magenta',
      corIntradorso: 'Branco',
      corExtradorso: 'Preto',
      linhasTirantes: 'Ok',
      linhasTirantesObs: 'Tirantes sem desgaste',
      linhasBatoquesArgolas: 'Ok',
      linhasBatoquesArgolasObs: 'Perfeito estado',
      linhasRoldanas: 'Ok',
      linhasRoldanasObs: 'Giro livre e limpo',
      linhasDistorcedor: 'Ok',
      linhasDistorcedorObs: 'Funcionamento normal',
      linhasCarga: 'Ok',
      linhasCargaObs: 'Teste de tração aprovado',
      linhasTroca: 'Não Ok',
      linhasTrocaObs: 'Troca preventiva da linha A1 realizada',
      linhasSimetria: 'Ok',
      linhasSimetriaObs: 'Ok',
      linhasTrimagem: 'Ok',
      linhasTrimagemObs: 'Trimagem dentro dos parâmetros de fábrica',
      tecidoCheckPerfil: 'Ok',
      tecidoCheckPerfilObs: 'Perfis íntegros',
      tecidoCheckIntradorso: 'Ok',
      tecidoCheckIntradorsoObs: 'Sem furos ou deformações',
      tecidoCheckBordoAtaque: 'Ok',
      tecidoCheckBordoAtaqueObs: 'Sem escoriações',
      tecidoCheckExtradorso: 'Ok',
      tecidoCheckExtradorsoObs: 'Tecido limpo e selado',
      tecidoTesteResistencia: 'Conforme',
      tecidoPorosidadeBordoAtaque: 'Excelente (280s)',
      tecidoPorosidadeExtradorso: 'Excelente (300s)',
      parecerConformeFabricante: 'Sim',
      observacoes: 'Vela em excelente estado de conservação. Pronta para voo com segurança total.',
      parecerGeral: 'OTIMO',
      criadoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
      atualizadoEm: new Date().toISOString(),
      pdfUri: undefined,
    },
    {
      id: 'mock-1002',
      numeroLaudo: 'LRP-2026-4405',
      dataEmissao: '2026-07-28',
      nomeProprietario: 'Fernanda Rossi',
      cidade: 'Florianópolis',
      estado: 'SC',
      cidadeEstado: 'Florianópolis - SC',
      telefone: '(48) 99123-5566',
      endereco: 'Rua das Rendeiras, 450 - Lagoa da Conceição',
      email: 'fernanda.rossi@email.com',
      fabricaModelo: 'Advance Sigma 11',
      numeroSerie: 'ADV-77301',
      dataFabricacao: '2022-09-10',
      corBordoAtaque: 'Azul Turquesa',
      corIntradorso: 'Cinza',
      corExtradorso: 'Laranja',
      linhasTirantes: 'Ok',
      linhasTirantesObs: '',
      linhasBatoquesArgolas: 'Ok',
      linhasBatoquesArgolasObs: '',
      linhasRoldanas: 'Ok',
      linhasRoldanasObs: '',
      linhasDistorcedor: 'Ok',
      linhasDistorcedorObs: '',
      linhasCarga: 'Ok',
      linhasCargaObs: '',
      linhasTroca: 'Não Ok',
      linhasTrocaObs: 'Sem necessidade de troca',
      linhasSimetria: 'Ok',
      linhasSimetriaObs: '',
      linhasTrimagem: 'Ok',
      linhasTrimagemObs: 'Ajuste fino realizado no freio',
      tecidoCheckPerfil: 'Ok',
      tecidoCheckPerfilObs: '',
      tecidoCheckIntradorso: 'Ok',
      tecidoCheckIntradorsoObs: '',
      tecidoCheckBordoAtaque: 'Ok',
      tecidoCheckBordoAtaqueObs: '',
      tecidoCheckExtradorso: 'Ok',
      tecidoCheckExtradorsoObs: '',
      tecidoTesteResistencia: 'Conforme',
      tecidoPorosidadeBordoAtaque: 'Ótimo (210s)',
      tecidoPorosidadeExtradorso: 'Ótimo (240s)',
      parecerConformeFabricante: 'Sim',
      observacoes: 'Equipamento bem cuidado. Revisão periódica de 100 horas concluída com sucesso.',
      parecerGeral: 'MUITO_BOM',
      fotoUri: undefined,
      criadoEm: new Date(Date.now() - 3600000 * 24).toISOString(),
      atualizadoEm: new Date().toISOString(),
      pdfUri: undefined,
    },
    {
      id: 'mock-1003',
      numeroLaudo: 'LRP-2026-3190',
      dataEmissao: '2026-07-20',
      nomeProprietario: 'Roberto Guimarães',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cidadeEstado: 'Rio de Janeiro - RJ',
      telefone: '(21) 97654-3210',
      endereco: 'Estrada das Canoas, 1200 - São Conrado',
      email: 'roberto.guimaraes@email.com',
      fabricaModelo: 'Niviuk Artik 6',
      numeroSerie: 'NVK-55412',
      dataFabricacao: '2021-11-05',
      corBordoAtaque: 'Verde Limão',
      corIntradorso: 'Branco',
      corExtradorso: 'Azul Marinho',
      linhasTirantes: 'Ok',
      linhasTirantesObs: '',
      linhasBatoquesArgolas: 'Ok',
      linhasBatoquesArgolasObs: '',
      linhasRoldanas: 'Ok',
      linhasRoldanasObs: '',
      linhasDistorcedor: 'Ok',
      linhasDistorcedorObs: '',
      linhasCarga: 'Ok',
      linhasCargaObs: 'Re-alongamento das linhas A e B efetuado',
      linhasTroca: 'Não Ok',
      linhasTrocaObs: '',
      linhasSimetria: 'Não Ok',
      linhasSimetriaObs: 'Assimetria observada',
      linhasTrimagem: 'Não Ok',
      linhasTrimagemObs:
        'Diferença de 8mm detectada na galeria C. Trimagem recomendada após 30h de voo.',
      tecidoCheckPerfil: 'Ok',
      tecidoCheckPerfilObs: '',
      tecidoCheckIntradorso: 'Ok',
      tecidoCheckIntradorsoObs: '',
      tecidoCheckBordoAtaque: 'Não Ok',
      tecidoCheckBordoAtaqueObs: 'Pequeno adesivo Ripstop aplicado no bordo de ataque (célula 14)',
      tecidoCheckExtradorso: 'Ok',
      tecidoCheckExtradorsoObs: '',
      tecidoTesteResistencia: 'Conforme',
      tecidoPorosidadeBordoAtaque: 'Bom (140s)',
      tecidoPorosidadeExtradorso: 'Bom (160s)',
      parecerConformeFabricante: 'Sim',
      observacoes: 'Vela em estado operacional. Atentar para a próxima revisão de trimagem.',
      parecerGeral: 'USADO_BOM_ESTADO',
      fotoUri: undefined,
      criadoEm: new Date(Date.now() - 3600000 * 48).toISOString(),
      atualizadoEm: new Date().toISOString(),
      pdfUri: undefined,
    },
    {
      id: 'mock-1004',
      numeroLaudo: 'LRP-2026-1049',
      dataEmissao: '2026-07-15',
      nomeProprietario: 'Marcelo Alencar',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      cidadeEstado: 'Belo Horizonte - MG',
      telefone: '(31) 98877-6655',
      endereco: 'Rua da Serra, 300 - Mangabeiras',
      email: 'marcelo.alencar@email.com',
      fabricaModelo: 'BGD Cure 2',
      numeroSerie: 'BGD-33108',
      dataFabricacao: '2020-03-20',
      corBordoAtaque: 'Amarelo Neon',
      corIntradorso: 'Violeta',
      corExtradorso: 'Rosa',
      linhasTirantes: 'Ok',
      linhasTirantesObs: '',
      linhasBatoquesArgolas: 'Não Ok',
      linhasBatoquesArgolasObs: 'Desgaste moderado no velcro do batoque',
      linhasRoldanas: 'Ok',
      linhasRoldanasObs: '',
      linhasDistorcedor: 'Ok',
      linhasDistorcedorObs: '',
      linhasCarga: 'Não Ok',
      linhasCargaObs: 'Linha C2 esquerda com capa puída',
      linhasTroca: 'Não Ok',
      linhasTrocaObs: 'Troca obrigatória de 2 linhas intermediárias',
      linhasSimetria: 'Não Ok',
      linhasSimetriaObs: 'Encurtamento das linhas de freio em 1.5cm',
      linhasTrimagem: 'Não Ok',
      linhasTrimagemObs: 'Encurtamento das linhas de freio em 1.5cm',
      tecidoCheckPerfil: 'Ok',
      tecidoCheckPerfilObs: '',
      tecidoCheckIntradorso: 'Ok',
      tecidoCheckIntradorsoObs: '',
      tecidoCheckBordoAtaque: 'Não Ok',
      tecidoCheckBordoAtaqueObs: 'Porosidade reduzida na zona de impacto central',
      tecidoCheckExtradorso: 'Ok',
      tecidoCheckExtradorsoObs: '',
      tecidoTesteResistencia: 'Conforme',
      tecidoPorosidadeBordoAtaque: 'Razoável (65s)',
      tecidoPorosidadeExtradorso: 'Bom (110s)',
      parecerConformeFabricante: 'Com Restrições',
      observacoes: 'Uso recomendado exclusivamente em condições suaves. Evitar voos fortes.',
      parecerGeral: 'USADO_RAZOAVEL',
      fotoUri: undefined,
      criadoEm: new Date(Date.now() - 3600000 * 72).toISOString(),
      atualizadoEm: new Date().toISOString(),
      pdfUri: undefined,
    },
    {
      id: 'mock-1005',
      numeroLaudo: 'LRP-2026-9201',
      dataEmissao: '2026-07-01',
      nomeProprietario: 'Juliana Mendes',
      cidade: 'Curitiba',
      estado: 'PR',
      cidadeEstado: 'Curitiba - PR',
      telefone: '(41) 99888-7766',
      endereco: 'Rua XV de Novembro, 800 - Centro',
      email: 'juliana.mendes@email.com',
      fabricaModelo: 'Gin Bonanza 2',
      numeroSerie: 'GIN-11094',
      dataFabricacao: '2018-06-12',
      corBordoAtaque: 'Vermelho',
      corIntradorso: 'Cinza Claro',
      corExtradorso: 'Branco',
      linhasTirantes: 'Não Ok',
      linhasTirantesObs: 'Desfilamento estrutural na costura principal',
      linhasBatoquesArgolas: 'Não Ok',
      linhasBatoquesArgolasObs: 'Oxidação avançada nas argolas',
      linhasRoldanas: 'Não Ok',
      linhasRoldanasObs: 'Roldana travada e desgastada',
      linhasDistorcedor: 'Não Ok',
      linhasDistorcedorObs: '',
      linhasCarga: 'Não Ok',
      linhasCargaObs: 'Ruptura no teste de carga a 45kg (mínimo exigido 80kg)',
      linhasTroca: 'Não Ok',
      linhasTrocaObs: 'Necessita jogo completo de linhas novas',
      linhasSimetria: 'Não Ok',
      linhasSimetriaObs: 'Assimetria severa superior a 35mm',
      linhasTrimagem: 'Não Ok',
      linhasTrimagemObs: 'Assimetria severa superior a 35mm',
      tecidoCheckPerfil: 'Não Ok',
      tecidoCheckPerfilObs: 'Rasgo de 12cm no perfil interno da célula 22',
      tecidoCheckIntradorso: 'Não Ok',
      tecidoCheckIntradorsoObs: 'Descolamento da resina',
      tecidoCheckBordoAtaque: 'Não Ok',
      tecidoCheckBordoAtaqueObs: 'Porosidade crítica abaixo de 10s',
      tecidoCheckExtradorso: 'Não Ok',
      tecidoCheckExtradorsoObs: 'Tecido cristalizado e quebradiço pelo sol',
      tecidoTesteResistencia: 'Reprovado',
      tecidoPorosidadeBordoAtaque: 'Crítico (6s)',
      tecidoPorosidadeExtradorso: 'Crítico (8s)',
      parecerConformeFabricante: 'Não',
      observacoes:
        'EQUIPAMENTO CONDENADO PARA VOO. Alto risco de colapso estrutural e rasgo em voo. Não homologado.',
      parecerGeral: 'CONDENADO',
      fotoUri: undefined,
      criadoEm: new Date(Date.now() - 3600000 * 120).toISOString(),
      atualizadoEm: new Date().toISOString(),
      pdfUri: undefined,
    },
  ];

  for (const item of mockLaudos) {
    await saveLaudo(item);
  }
}
