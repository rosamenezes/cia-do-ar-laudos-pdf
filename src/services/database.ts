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
  } catch (e) {}

  try {
    await db.execAsync(`ALTER TABLE laudos_parapente ADD COLUMN estado TEXT NOT NULL DEFAULT '';`);
  } catch (e) {}
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
      linhasDistorcedor, linhasDistorcedorObs, linhasCarga, linhasCargaObs, linhasTroca, linhasTrocaObs, linhasSimetriaTrimagem, linhasSimetriaTrimagemObs,
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
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?
    )`,
    [
      laudo.id, laudo.numeroLaudo, laudo.dataEmissao,
      laudo.nomeProprietario, cidadeVal, estadoVal, cidadeEstadoVal, laudo.telefone, laudo.endereco, laudo.email,
      laudo.fabricaModelo, laudo.numeroSerie, laudo.dataFabricacao, laudo.corBordoAtaque, laudo.corIntradorso, laudo.corExtradorso,
      laudo.linhasTirantes, laudo.linhasTirantesObs, laudo.linhasBatoquesArgolas, laudo.linhasBatoquesArgolasObs, laudo.linhasRoldanas, laudo.linhasRoldanasObs,
      laudo.linhasDistorcedor, laudo.linhasDistorcedorObs, laudo.linhasCarga, laudo.linhasCargaObs, laudo.linhasTroca, laudo.linhasTrocaObs, laudo.linhasSimetriaTrimagem, laudo.linhasSimetriaTrimagemObs,
      laudo.tecidoCheckPerfil, laudo.tecidoCheckPerfilObs, laudo.tecidoCheckIntradorso, laudo.tecidoCheckIntradorsoObs,
      laudo.tecidoCheckBordoAtaque, laudo.tecidoCheckBordoAtaqueObs, laudo.tecidoCheckExtradorso, laudo.tecidoCheckExtradorsoObs,
      laudo.tecidoTesteResistencia, laudo.tecidoPorosidadeBordoAtaque, laudo.tecidoPorosidadeIntradorso, laudo.tecidoPorosidadeExtradorso,
      laudo.parecerConformeFabricante, laudo.observacoes,
      laudo.parecerGeral, laudo.fotoUri ?? null,
      laudo.criadoEm, laudo.atualizadoEm, laudo.pdfUri ?? null,
    ]
  );
}

export async function getLaudos(): Promise<LaudoParapente[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LaudoParapente>(
    'SELECT * FROM laudos_parapente ORDER BY criadoEm DESC'
  );
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
  await db.runAsync(
    'UPDATE laudos_parapente SET pdfUri = ?, atualizadoEm = ? WHERE id = ?',
    [pdfUri, new Date().toISOString(), id]
  );
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
