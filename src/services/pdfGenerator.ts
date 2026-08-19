import { LaudoParapente } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';

export async function generateAndShare(laudo: LaudoParapente): Promise<void> {
  const html = await generateLaudoHtml(laudo);

  // Injeta um script no HTML para imprimir automaticamente assim que abrir
  const htmlWithPrint = html.replace(
    '</body>',
    '<script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script></body>'
  );

  const blob = new Blob([htmlWithPrint], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Tenta abrir numa nova aba. Se o bloqueador do iPhone (Safari) barrar, abre na aba atual.
  const newWindow = window.open(url, '_blank');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    window.location.href = url;
  }
}
