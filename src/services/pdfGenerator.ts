import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LaudoParapente } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';
import { updatePdfUri } from './database';

export async function generateAndSavePdf(laudo: LaudoParapente): Promise<string> {
  const html = await generateLaudoHtml(laudo);

  if (Platform.OS === 'web') {
    // Na web não salvamos no sistema de arquivos local
    return '';
  }

  // Gerar PDF nativo
  const { uri: tempUri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // Salvar permanentemente no celular
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
  if (Platform.OS === 'web') return; // Compartilhamento tratado de outra forma na Web
  
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

export async function generateAndShare(laudo: LaudoParapente): Promise<string> {
  const html = await generateLaudoHtml(laudo);

  if (Platform.OS === 'web') {
    // Na Web, criamos um iframe invisível para imprimir APENAS o laudo gerado,
    // em vez de imprimir a tela atual do aplicativo
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // Espera um pouco para o navegador renderizar as imagens e fontes antes de imprimir
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Limpeza: remove o iframe invisível depois que a caixa de impressão for fechada
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    
    return '';
  }

  const pdfUri = await generateAndSavePdf(laudo);
  await sharePdf(pdfUri);
  return pdfUri;
}
