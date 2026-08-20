import { LaudoParapente } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';

export async function generatePdfHtml(laudo: LaudoParapente): Promise<string> {
  const html = await generateLaudoHtml(laudo);
  return html;
}

export async function generatePdfBlob(laudo: LaudoParapente): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Geração de PDF só é suportada no navegador');
  }

  // Import dinâmico para não quebrar no SSR do Expo
  // @ts-ignore
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const html = await generateLaudoHtml(laudo);
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Ajustes cruciais para iOS Safari não renderizar em branco
  container.style.position = 'absolute';
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.width = '210mm';
  container.style.zIndex = '-9999'; // Esconde atrás do #root da aplicação
  container.style.opacity = '1'; // DEVE ser 1, senão o iOS recusa renderizar no canvas
  container.style.pointerEvents = 'none';
  
  document.body.appendChild(container);

  // Aguarda 1.5s para garantir que as imagens (como a logo) carreguem antes do print
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Laudo-${laudo.numeroLaudo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 800
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const worker = html2pdf().set(opt).from(container);
    const pdfBlob: Blob = await worker.outputPdf('blob');
    return pdfBlob;
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}


