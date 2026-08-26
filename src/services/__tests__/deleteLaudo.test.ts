const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteObject = jest.fn().mockResolvedValue(undefined);
const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn((_db, _col, id) => ({ id })),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn((_storage, url) => ({ url })),
  uploadString: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
}));

jest.mock('../firebaseConfig', () => ({ db: {}, storage: {} }));

import { deleteLaudo } from '../database';

const STORAGE = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/fotos%2F';

function documento(dados: Record<string, unknown> | null) {
  return { exists: () => dados !== null, data: () => dados };
}

/**
 * Regressão: `deleteLaudo` apagava só o documento. As fotos ficavam órfãs no
 * Storage para sempre, acumulando custo sem nada que as referenciasse.
 */
describe('deleteLaudo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('apaga o documento e todas as fotos que estão no Storage', async () => {
    mockGetDoc.mockResolvedValue(
      documento({
        id: 'laudo-1',
        fotoUri: `${STORAGE}principal.jpg`,
        fotoSeloUri: `${STORAGE}selo.jpg`,
        fotosAdicionais: [{ uri: `${STORAGE}extra0.jpg`, descricao: 'rasgo' }],
      })
    );

    await deleteLaudo('laudo-1');

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteObject).toHaveBeenCalledTimes(3);
    expect(mockDeleteObject.mock.calls.map(([alvo]) => alvo.url).sort()).toEqual([
      `${STORAGE}extra0.jpg`,
      `${STORAGE}principal.jpg`,
      `${STORAGE}selo.jpg`,
    ]);
  });

  it('ignora URIs que não vieram do Storage', async () => {
    mockGetDoc.mockResolvedValue(
      documento({ id: 'laudo-2', fotoUri: 'file:///local/foto.jpg', fotosAdicionais: [] })
    );

    await deleteLaudo('laudo-2');

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it('apaga o laudo mesmo se uma foto não puder ser removida', async () => {
    mockGetDoc.mockResolvedValue(
      documento({ id: 'laudo-3', fotoUri: `${STORAGE}sumiu.jpg`, fotosAdicionais: [] })
    );
    mockDeleteObject.mockRejectedValueOnce(new Error('object-not-found'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(deleteLaudo('laudo-3')).resolves.toBeUndefined();
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it('não quebra quando o laudo já não existe', async () => {
    mockGetDoc.mockResolvedValue(documento(null));

    await expect(deleteLaudo('sumido')).resolves.toBeUndefined();
    expect(mockDeleteObject).not.toHaveBeenCalled();
  });
});
