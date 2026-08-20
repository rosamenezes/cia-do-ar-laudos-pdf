import { LaudoParapente } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';

export async function generatePdfHtml(laudo: LaudoParapente): Promise<string> {
  const html = await generateLaudoHtml(laudo);
  return html;
}
