import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { LaudoParapente, porosityMapDoFirestore, porosityMapParaFirestore } from '../types/laudo';

const COLLECTION_NAME = 'laudos_parapente';

/**
 * Traz o documento cru do Firestore de volta para o formato usado na aplicação.
 *
 * O `null` é um detalhe de armazenamento: o Firestore não aceita `undefined`, e
 * `saveLaudo` troca um pelo outro na gravação. Desfazer a troca aqui importa
 * porque o schema do formulário declara os campos como `.optional()`, que
 * reprova `null` — era o que travava, sem aviso, a edição de qualquer laudo sem
 * foto.
 */
function fromFirestore(data: any): LaudoParapente {
  const laudo: Record<string, any> = {};
  Object.entries(data ?? {}).forEach(([chave, valor]) => {
    laudo[chave] = valor === null ? undefined : valor;
  });
  laudo.porosidade = porosityMapDoFirestore(data?.porosidade);
  return laudo as LaudoParapente;
}

export async function saveLaudo(laudo: LaudoParapente): Promise<void> {
  const cidadeVal = laudo.cidade ?? '';
  const estadoVal = laudo.estado ?? '';
  // Sem campos obrigatórios, cidade ou UF podem vir vazias: evita gravar " - " solto
  const cidadeEstadoVal = [cidadeVal, estadoVal]
    .filter((part) => part.trim() !== '')
    .join(' - ');

  // Fotos novas chegam em Base64. Elas PRECISAM ir para o Storage: um documento
  // do Firestore tem limite de 1 MiB, que poucas fotos embutidas já estouram.
  // Depois do upload guardamos apenas a URL pública.
  const uploadSeNecessario = async (uri: string | undefined, sufixo: string) => {
    if (!uri || !uri.startsWith('data:image')) return uri;
    const storageRef = ref(storage, `fotos/${laudo.id}_${sufixo}_${Date.now()}.jpg`);
    await uploadString(storageRef, uri, 'data_url');
    return await getDownloadURL(storageRef);
  };

  const finalFotoUri = await uploadSeNecessario(laudo.fotoUri, 'principal');
  const finalFotoSeloUri = await uploadSeNecessario(laudo.fotoSeloUri, 'selo');

  const finalFotosAdicionais = await Promise.all(
    (laudo.fotosAdicionais ?? []).map(async (foto, i) => ({
      uri: (await uploadSeNecessario(foto.uri, `extra${i}`)) ?? '',
      descricao: foto.descricao ?? '',
    }))
  );

  const docRef = doc(db, COLLECTION_NAME, laudo.id);

  const payload: any = {
    ...laudo,
    cidade: cidadeVal,
    estado: estadoVal,
    cidadeEstado: cidadeEstadoVal,
    fotoUri: finalFotoUri, // Salva a URL nova
    fotoSeloUri: finalFotoSeloUri,
    fotosAdicionais: finalFotosAdicionais,
    // A grade 3x5 é um array de arrays, e o Firestore recusa arrays aninhados:
    // gravamos cada coluna embrulhada em um objeto (ver porosityMapParaFirestore).
    porosidade: porosityMapParaFirestore(laudo.porosidade),
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
  // ATENÇÃO: Adicionado limite de 15 para carregar instantaneamente!
  const q = query(collection(db, COLLECTION_NAME), orderBy('criadoEm', 'desc'), limit(15));
  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await seedMockLaudos();
      const newSnapshot = await getDocs(q);
      return newSnapshot.docs.map((doc) => fromFirestore(doc.data()));
    }

    return snapshot.docs.map((doc) => fromFirestore(doc.data()));
  } catch (error) {
    console.error('Erro ao buscar laudos:', error);
    return [];
  }
}

/**
 * O histórico inteiro, sem o corte de 15 da listagem.
 *
 * A lista da tela carrega só a primeira página para abrir rápido, mas a busca
 * não pode herdar esse corte: procurar por um piloto ou número de série antigo
 * precisa varrer tudo, senão o laudo simplesmente não é encontrado.
 */
export async function getTodosLaudos(): Promise<LaudoParapente[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('criadoEm', 'desc'));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((documento) => fromFirestore(documento.data()));
  } catch (error) {
    console.error('Erro ao buscar o histórico de laudos:', error);
    throw error;
  }
}

export async function getLaudoById(id: string): Promise<LaudoParapente | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return fromFirestore(docSnap.data());
  }
  return null;
}

/**
 * As fotos ficam no Storage, fora do documento. Apagar só o documento deixaria
 * os arquivos órfãos lá, acumulando custo sem nada que os referencie.
 */
async function apagarFotosDoStorage(laudo: LaudoParapente | null): Promise<void> {
  if (!laudo) return;

  const urls = [
    laudo.fotoUri,
    laudo.fotoSeloUri,
    ...(laudo.fotosAdicionais ?? []).map((foto) => foto.uri),
  ].filter((url): url is string => !!url && url.includes('firebasestorage.googleapis.com'));

  await Promise.all(
    urls.map(async (url) => {
      try {
        await deleteObject(ref(storage, url));
      } catch (error) {
        // Arquivo já removido, ou sem permissão: não é motivo para impedir a
        // exclusão do laudo em si, que é o que o usuário pediu.
        console.warn('Não foi possível apagar a foto do Storage:', url, error);
      }
    })
  );
}

export async function deleteLaudo(id: string): Promise<void> {
  const laudo = await getLaudoById(id);
  await deleteDoc(doc(db, COLLECTION_NAME, id));
  await apagarFotosDoStorage(laudo);
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
