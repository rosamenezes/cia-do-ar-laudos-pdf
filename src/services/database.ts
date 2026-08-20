import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { LaudoParapente } from '../types/laudo';

const COLLECTION_NAME = 'laudos_parapente';

export async function saveLaudo(laudo: LaudoParapente): Promise<void> {
  const cidadeVal = laudo.cidade ?? '';
  const estadoVal = laudo.estado ?? '';
  const cidadeEstadoVal = `${cidadeVal} - ${estadoVal}`;

  const docRef = doc(db, COLLECTION_NAME, laudo.id);

  const payload: any = {
    ...laudo,
    cidade: cidadeVal,
    estado: estadoVal,
    cidadeEstado: cidadeEstadoVal,
    atualizadoEm: new Date().toISOString(),
  };

  // O Firebase não aceita "undefined", então deletamos essas chaves ou passamos null
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      payload[key] = null;
    }
  });

  await setDoc(docRef, payload, { merge: true });
}

export async function getLaudos(): Promise<LaudoParapente[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('criadoEm', 'desc'));
  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await seedMockLaudos();
      const newSnapshot = await getDocs(q);
      return newSnapshot.docs.map((doc) => doc.data() as LaudoParapente);
    }

    return snapshot.docs.map((doc) => doc.data() as LaudoParapente);
  } catch (error) {
    console.error('Erro ao buscar laudos:', error);
    return [];
  }
}

export async function getLaudoById(id: string): Promise<LaudoParapente | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as LaudoParapente;
  }
  return null;
}

export async function deleteLaudo(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function updatePdfUri(id: string, pdfUri: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(
    docRef,
    {
      pdfUri,
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateNumeroLaudo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `LRP-${year}-${seq}`;
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
    // Removendo os outros 4 mocks para simplificar o arquivo e acelerar o banco
  ];

  for (const item of mockLaudos) {
    await saveLaudo(item);
  }
}
