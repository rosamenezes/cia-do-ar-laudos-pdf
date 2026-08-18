import {
  getDatabase,
  saveLaudo,
  getLaudos,
  getLaudoById,
  deleteLaudo,
  updatePdfUri,
  generateId,
  generateNumeroLaudo,
} from '../database';
import { LaudoParapente } from '../../types/laudo';

describe('database service', () => {
  const mockLaudo: LaudoParapente = {
    id: 'laudo-test-1',
    numeroLaudo: 'LRP-2026-1234',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Maria Oliveira',
    cidade: 'Campinas',
    estado: 'SP',
    cidadeEstado: 'Campinas - SP',
    telefone: '(19) 98888-1111',
    endereco: 'Rua A, 50',
    email: 'maria@example.com',
    fabricaModelo: 'SOL Advance',
    numeroSerie: 'SOL-12345',
    dataFabricacao: '2022-05-10',
    corBordoAtaque: 'Azul',
    corIntradorso: 'Amarelo',
    corExtradorso: 'Preto',
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
    linhasTroca: 'Ok',
    linhasTrocaObs: '',
    linhasSimetria: 'Ok',
    linhasSimetriaObs: '',
    linhasTrimagem: 'Ok',
    linhasTrimagemObs: '',
    tecidoCheckPerfil: 'Ok',
    tecidoCheckPerfilObs: '',
    tecidoCheckIntradorso: 'Ok',
    tecidoCheckIntradorsoObs: '',
    tecidoCheckBordoAtaque: 'Ok',
    tecidoCheckBordoAtaqueObs: '',
    tecidoCheckExtradorso: 'Ok',
    tecidoCheckExtradorsoObs: '',
    tecidoTesteResistencia: 'Conforme',
    tecidoPorosidadeBordoAtaque: '200s',
    tecidoPorosidadeExtradorso: '250s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Tudo OK',
    parecerGeral: 'OTIMO',
    fotoUri: 'file:///mock/foto.jpg',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve obter a instância do banco de dados', async () => {
    const db = await getDatabase();
    expect(db).toBeDefined();
    expect(db.execAsync).toHaveBeenCalled();
  });

  it('deve salvar e buscar um laudo por ID', async () => {
    await saveLaudo(mockLaudo);
    const db = await getDatabase();
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockLaudo);

    const found = await getLaudoById('laudo-test-1');
    expect(found).toEqual(mockLaudo);
  });

  it('deve retornar a lista de laudos', async () => {
    const db = await getDatabase();
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([mockLaudo]);

    const list = await getLaudos();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toBe('laudo-test-1');
  });

  it('deve excluir um laudo', async () => {
    await deleteLaudo('laudo-test-1');
    const db = await getDatabase();
    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM laudos_parapente WHERE id = ?', [
      'laudo-test-1',
    ]);
  });

  it('deve atualizar a URI do PDF', async () => {
    await updatePdfUri('laudo-test-1', 'file:///mock/laudo.pdf');
    const db = await getDatabase();
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE laudos_parapente SET pdfUri = ?'),
      expect.arrayContaining(['file:///mock/laudo.pdf', 'laudo-test-1'])
    );
  });

  it('deve gerar ID e Número de Laudo válidos', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);

    const num = generateNumeroLaudo();
    expect(num).toMatch(/^LRP-202\d-\d{4}$/);
  });
});
