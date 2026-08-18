const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Requisições para laudoTemplate
const { generateLaudoHtml } = require('../src/templates/laudoTemplate');

async function generatePdf() {
  const photoPath = '/Users/guilhermemenezes/.gemini/antigravity/brain/917cf260-a728-49a1-85dc-a59c07a1ead2/.user_uploaded/media_1787056116227.jpg';
  const photoBuffer = fs.readFileSync(photoPath);
  const photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;

  const laudo = {
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
    linhasSimetriaTrimagem: 'Ok',
    linhasSimetriaTrimagemObs: 'Trimagem dentro dos parâmetros de fábrica',

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
    tecidoPorosidadeIntradorso: 'Excelente (320s)',
    tecidoPorosidadeExtradorso: 'Excelente (300s)',
    parecerConformeFabricante: 'Sim',
    observacoes: 'Vela em excelente estado de conservação. Pronta para voo com segurança total.',
    parecerGeral: 'OTIMO',
    fotoUri: photoBase64,
    criadoEm: '2026-08-01T10:00:00.000Z',
    atualizadoEm: '2026-08-01T10:00:00.000Z',
  };

  const html = await generateLaudoHtml(laudo);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPdf = path.join(__dirname, 'pdfs_teste', 'Laudo_LRP-2026-8812_com_foto.pdf');
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  await browser.close();
  console.log('PDF gerado com sucesso em:', outputPdf);
}

generatePdf().catch(console.error);
