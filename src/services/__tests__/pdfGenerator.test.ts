import { generateAndSavePdf, sharePdf, generateAndShare } from '../pdfGenerator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LaudoParapente } from '../../types/laudo';

jest.mock('../database', () => ({
  updatePdfUri: jest.fn().mockResolvedValue(undefined),
}));

describe('pdfGenerator service', () => {
  const mockLaudo: LaudoParapente = {
    id: 'laudo-pdf-1',
    numeroLaudo: 'LRP-2026-9999',
    dataEmissao: '2026-08-03',
    nomeProprietario: 'Pedro Santos',
    cidade: 'Santos',
    estado: 'SP',
    telefone: '(13) 97777-6666',
    endereco: 'Av. Ana Costa',
    email: 'pedro@example.com',
    fabricaModelo: 'Ozone Rush',
    numeroSerie: 'OZN-1111',
    dataFabricacao: '2023-01-01',
    corBordoAtaque: 'Verde',
    corIntradorso: 'Preto',
    corExtradorso: 'Branco',
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
    tecidoPorosidadeBordoAtaque: '180s',
    tecidoPorosidadeExtradorso: '200s',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Tudo OK',
    parecerGeral: 'MUITO_BOM',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  it('deve gerar e salvar o PDF com sucesso', async () => {
    const pdfUri = await generateAndSavePdf(mockLaudo);

    expect(Print.printToFileAsync).toHaveBeenCalled();
    expect(pdfUri).toContain('laudo_LRP_2026_9999.pdf');
  });

  it('deve compartilhar o PDF quando disponível', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(true);

    await sharePdf('file:///mock/laudo.pdf');

    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///mock/laudo.pdf', expect.any(Object));
  });

  it('deve lançar erro ao tentar compartilhar se não disponível', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

    await expect(sharePdf('file:///mock/laudo.pdf')).rejects.toThrow(
      'Compartilhamento não disponível neste dispositivo'
    );
  });

  it('deve gerar e compartilhar em conjunto', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(true);

    const pdfUri = await generateAndShare(mockLaudo);

    expect(pdfUri).toBeDefined();
    expect(Sharing.shareAsync).toHaveBeenCalled();
  });
});
