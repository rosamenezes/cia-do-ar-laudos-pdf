import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Laudo } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';
import { updatePdfUri } from './database';

export async function generateAndSavePdf(laudo: Laudo): Promise<string> {
  const html = await generateLaudoHtml(laudo);

  // Gerar PDF
  const { uri: tempUri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // Salvar permanentemente
  const dir = FileSystem.documentDirectory + 'pdfs/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const filename = `laudo_${laudo.numeroLaudo.replace(/-/g, '_')}.pdf`;
  const destUri = dir + filename;

  await FileSystem.copyAsync({ from: tempUri, to: destUri });

  // Atualizar no banco
  await updatePdfUri(laudo.id, destUri);

  return destUri;
}

export async function sharePdf(pdfUri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Compartilhamento não disponível neste dispositivo');
  }
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar Laudo',
    UTI: 'com.adobe.pdf',
  });
}

export async function generateAndShare(laudo: Laudo): Promise<string> {
  const pdfUri = await generateAndSavePdf(laudo);
  await sharePdf(pdfUri);
  return pdfUri;
}
