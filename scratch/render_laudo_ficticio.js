const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const os = require('os');

// Ler o arquivo logoAsset.ts para extrair LOGO_BASE64
const logoAssetPath = path.join(__dirname, '..', 'src', 'templates', 'logoAsset.ts');
const logoAssetContent = fs.readFileSync(logoAssetPath, 'utf8');
const logoMatch = logoAssetContent.match(/export const LOGO_BASE64 =\s*'([^']+)';/);
const LOGO_BASE64 = logoMatch ? logoMatch[1] : '';

// Ler a foto enviada pelo usuário e converter em base64
const photoPath =
  '/Users/guilhermemenezes/.gemini/antigravity/brain/917cf260-a728-49a1-85dc-a59c07a1ead2/.user_uploaded/media_1787056116227.jpg';
let photoBase64 = '';
if (fs.existsSync(photoPath)) {
  const photoBuffer = fs.readFileSync(photoPath);
  photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
}

const laudo = {
  id: 'mock-9999',
  numeroLaudo: 'LRP-2026-9999',
  dataEmissao: '18/08/2026',
  nomeProprietario: 'João Voador da Silva',
  cidade: 'Rio de Janeiro',
  estado: 'RJ',
  cidadeEstado: 'Rio de Janeiro - RJ',
  telefone: '(21) 98888-7777',
  endereco: 'Rua das Nuvens Altas, 404',
  email: 'joao.voador@parapente.com',
  fabricaModelo: 'Niviuk Artik 6',
  numeroSerie: 'NVK-778899',
  dataFabricacao: '2024-02-20',
  corBordoAtaque: 'Verde Neon',
  corIntradorso: 'Branco',
  corExtradorso: 'Azul Marinho',

  linhasTirantes: 'Ok',
  linhasTirantesObs: 'Costuras íntegras',
  linhasBatoquesArgolas: 'Ok',
  linhasBatoquesArgolasObs: 'Argolas sem desgaste',
  linhasRoldanas: 'Ok',
  linhasRoldanasObs: 'Lubrificadas e soltas',
  linhasDistorcedor: 'Ok',
  linhasDistorcedorObs: 'Giro livre',
  linhasCarga: 'Ok',
  linhasCargaObs: 'Aprovado em 20kg',
  linhasTroca: 'Ok',
  linhasTrocaObs: 'Não houve necessidade',
  linhasSimetriaTrimagem: 'Ok',
  linhasSimetriaTrimagemObs: 'Simetria perfeita (diferença < 5mm)',

  tecidoCheckPerfil: 'Ok',
  tecidoCheckPerfilObs: 'Mylar sem quebras',
  tecidoCheckIntradorso: 'Ok',
  tecidoCheckIntradorsoObs: 'Tecido intacto',
  tecidoCheckBordoAtaque: 'Ok',
  tecidoCheckBordoAtaqueObs: 'Sem sujeira ou rasgos',
  tecidoCheckExtradorso: 'Ok',
  tecidoCheckExtradorsoObs: 'Cores vivas, sem desgaste UV severo',

  tecidoTesteResistencia: 'Conforme',
  tecidoPorosidadeBordoAtaque: 'Excelente (380s)',
  tecidoPorosidadeIntradorso: 'Excelente (420s)',
  tecidoPorosidadeExtradorso: 'Excelente (400s)',
  parecerConformeFabricante: 'Sim',
  observacoes:
    'LAUDO FICTÍCIO. Vela simulada encontra-se em estado excepcional, praticamente nova. Todas as medições indicam vida útil superior a 90%.',
  parecerGeral: 'OTIMO',
  fotoUri: photoBase64,
  criadoEm: '2026-08-18T10:00:00.000Z',
  atualizadoEm: '2026-08-18T10:00:00.000Z',
};

const renderStatusBadge = (status) => {
  if (status === 'Ok' || status === 'Correto') {
    return `<span style="display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">✓ Ok</span>`;
  }
  if (status === 'Não Ok' || status === 'Incorreto') {
    return `<span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">✕ Não Ok</span>`;
  }
  return `<span style="display: inline-block; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">${status}</span>`;
};

const renderObs = (obs) => {
  if (!obs || obs.trim() === '') return '';
  return `<div style="font-size: 9px; color: #64748b; margin-top: 3px; font-weight: 500; line-height: 1.2;">Obs: ${obs}</div>`;
};

const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Laudo ${laudo.numeroLaudo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #1e293b; font-size: 11px; line-height: 1.4; -webkit-print-color-adjust: exact; }
    @page { size: A4 portrait; margin: 2mm; }

    .pdf-page { width: 100%; max-width: 210mm; margin: 0 auto; padding: 6mm 10mm 8mm 10mm; box-sizing: border-box; page-break-after: always; position: relative; }
    .pdf-page.last-page { page-break-after: auto; }

    .global-watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 680px; max-width: 95%; opacity: 0.10; z-index: 0; pointer-events: none; }
    .page-content { position: relative; z-index: 1; }

    .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 3px solid #db2777; margin-bottom: 16px; }
    .brand-section h2 { font-size: 13px; font-weight: 700; color: #db2777; text-transform: uppercase; letter-spacing: 0.5px; }
    .contact-section { text-align: right; font-size: 10px; color: #64748b; font-weight: 500; }
    .contact-section strong { color: #0f172a; font-size: 11px; }

    .page-subheader { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 2px solid #db2777; margin-bottom: 14px; }
    .page-subheader-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .page-subheader-info { font-size: 9px; color: #94a3b8; }

    .section-title { font-size: 11px; font-weight: 800; color: #ffffff; background: linear-gradient(90deg, #0f172a 0%, #1e3a5f 100%); padding: 6px 12px 6px 14px; border-radius: 0 6px 6px 0; margin-top: 12px; margin-bottom: 7px; margin-left: -4px; text-transform: uppercase; letter-spacing: 0.6px; border-left: 5px solid #db2777; box-shadow: 2px 2px 6px rgba(0,0,0,0.12); }

    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th, td { border: 1px solid #e2e8f0; padding: 5px 9px; text-align: left; }
    table tr:nth-child(even) td { background-color: #f8fafc; }
    th { background-color: #f1f5f9; font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; width: 30%; }
    td { font-size: 11px; font-weight: 500; color: #0f172a; }

    .foto-card { margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    .foto-header { background: #f8fafc; padding: 4px 10px; font-weight: 700; font-size: 9px; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
    .foto-body { padding: 8px; text-align: center; background: #ffffff; }
    .foto-body img { max-width: 90%; max-height: 250px; width: auto; height: auto; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }

    .resultado-banner { margin-top: 20px; background: linear-gradient(135deg, #dcfce715 0%, #f0fdf408 100%); border: 2px solid #16a34a; border-radius: 12px; padding: 28px 20px 24px 20px; text-align: center; position: relative; overflow: hidden; }
    .resultado-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #db2777, #16a34a); }
    .resultado-icon { font-size: 52px; line-height: 1; margin-bottom: 10px; display: block; }
    .resultado-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px; }
    .resultado-value { font-size: 24px; font-weight: 900; color: #16a34a; letter-spacing: -0.5px; }
    .selo-qualidade { position: absolute; top: 12px; right: 14px; }

    .observacoes { margin-top: 20px; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-size: 11px; color: #334155; line-height: 1.6; }
    .footer-text { padding-top: 10px; margin-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }
  </style>
</head>
<body>

  <!-- MARCA D'ÁGUA GLOBAL -->
  <div class="global-watermark">
    <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
  </div>

  <!-- PÁGINA 1 — Dados + Identificação + Foto -->
  <div class="pdf-page">
    <div class="page-content">
      <div class="header">
        <div class="brand-section">
          <img src="${LOGO_BASE64}" style="max-height: 100px; width: auto; display: block; margin-bottom: 6px;" />
          <h2>LAUDO DE REVISÃO DE PARAPENTE</h2>
        </div>
        <div class="contact-section">
          <strong>@ciadoar</strong><br>
          (51) 98436-209<br>
          Laudo Nº: <strong>${laudo.numeroLaudo}</strong>
        </div>
      </div>

      <div class="section-title">👤 Dados do Proprietário</div>
      <table>
        <tr><th>Nome</th><td colspan="3">${laudo.nomeProprietario}</td></tr>
        <tr><th>Data da Revisão</th><td>${laudo.dataEmissao}</td><th>Telefone</th><td>${laudo.telefone}</td></tr>
        <tr><th>Cidade</th><td>${laudo.cidade}</td><th>Estado (UF)</th><td>${laudo.estado}</td></tr>
        <tr><th>Endereço</th><td>${laudo.endereco}</td><th>Email</th><td>${laudo.email}</td></tr>
      </table>

      <div class="section-title">🪂 Identificação da Vela</div>
      <table>
        <tr><th>Fábrica / Modelo</th><td colspan="3"><strong>${laudo.fabricaModelo}</strong></td></tr>
        <tr><th>Nº de Série</th><td>${laudo.numeroSerie}</td><th>Data de Fabricação</th><td>${laudo.dataFabricacao}</td></tr>
        <tr><th>Cor Bordo de Ataque</th><td>${laudo.corBordoAtaque}</td><th>Cor Intradorso</th><td>${laudo.corIntradorso}</td></tr>
        <tr><th>Cor Extradorso</th><td colspan="3">${laudo.corExtradorso}</td></tr>
      </table>

      ${
        laudo.fotoUri
          ? `
      <div class="foto-card">
        <div class="foto-header">📷 REGISTRO FOTOGRÁFICO DO EQUIPAMENTO</div>
        <div class="foto-body">
          <img src="${laudo.fotoUri}" alt="Foto da vela" />
        </div>
      </div>
      `
          : ''
      }
    </div>
  </div>

  <!-- PÁGINA 2 — Checagem de Linhas e Tecido -->
  <div class="pdf-page">
    <div class="page-content">
      <div class="page-subheader">
        <span class="page-subheader-title">Checagem Técnica</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      <div class="section-title">🧵 Checagem de Linhas</div>
      <table>
        <tr><th>Tirantes</th><td>${renderStatusBadge(laudo.linhasTirantes)}${renderObs(laudo.linhasTirantesObs)}</td></tr>
        <tr><th>Batoques e Argolas</th><td>${renderStatusBadge(laudo.linhasBatoquesArgolas)}${renderObs(laudo.linhasBatoquesArgolasObs)}</td></tr>
        <tr><th>Roldanas</th><td>${renderStatusBadge(laudo.linhasRoldanas)}${renderObs(laudo.linhasRoldanasObs)}</td></tr>
        <tr><th>Distorcedor</th><td>${renderStatusBadge(laudo.linhasDistorcedor)}${renderObs(laudo.linhasDistorcedorObs)}</td></tr>
        <tr><th>Carga nas Linhas</th><td>${renderStatusBadge(laudo.linhasCarga)}${renderObs(laudo.linhasCargaObs)}</td></tr>
        <tr><th>Troca de Linhas</th><td>${renderStatusBadge(laudo.linhasTroca)}${renderObs(laudo.linhasTrocaObs)}</td></tr>
        <tr><th>Simetria e Trimagem</th><td>${renderStatusBadge(laudo.linhasSimetriaTrimagem)}${renderObs(laudo.linhasSimetriaTrimagemObs)}</td></tr>
      </table>

      <div class="section-title">🛡️ Checagem do Tecido</div>
      <table>
        <tr><th>Check do Perfil</th><td>${renderStatusBadge(laudo.tecidoCheckPerfil)}${renderObs(laudo.tecidoCheckPerfilObs)}</td></tr>
        <tr><th>Check do Intradorso</th><td>${renderStatusBadge(laudo.tecidoCheckIntradorso)}${renderObs(laudo.tecidoCheckIntradorsoObs)}</td></tr>
        <tr><th>Check do Bordo Ataque</th><td>${renderStatusBadge(laudo.tecidoCheckBordoAtaque)}${renderObs(laudo.tecidoCheckBordoAtaqueObs)}</td></tr>
        <tr><th>Check do Extradorso</th><td>${renderStatusBadge(laudo.tecidoCheckExtradorso)}${renderObs(laudo.tecidoCheckExtradorsoObs)}</td></tr>
        <tr><th>Teste de Resistência</th><td>${renderStatusBadge(laudo.tecidoTesteResistencia)}</td></tr>
        <tr><th>Porosidade Bordo Ataque</th><td>${renderStatusBadge(laudo.tecidoPorosidadeBordoAtaque)}</td></tr>
        <tr><th>Porosidade Intradorso</th><td>${renderStatusBadge(laudo.tecidoPorosidadeIntradorso)}</td></tr>
        <tr><th>Porosidade Extradorso</th><td>${renderStatusBadge(laudo.tecidoPorosidadeExtradorso)}</td></tr>
      </table>
    </div>
  </div>

  <!-- PÁGINA 3 — Parecer Geral + Rodapé -->
  <div class="pdf-page last-page">
    <div class="page-content">
      <div class="page-subheader">
        <span class="page-subheader-title">Parecer Final</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      <div class="resultado-banner">
        <div class="selo-qualidade">
          <svg width="180" height="42" viewBox="0 0 180 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="179" height="41" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <circle cx="21" cy="21" r="11" fill="#ecfdf5"/>
            <path d="M 16 21 L 19 24 L 26 17" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="42" y="18" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#1e293b" letter-spacing="0.2px">INSPEÇÃO CERTIFICADA</text>
            <text x="42" y="29" font-family="'Inter', sans-serif" font-size="7" font-weight="500" fill="#64748b">Cia. do Ar • Padrão de Qualidade</text>
          </svg>
        </div>
        <span class="resultado-icon">✅</span>
        <div class="resultado-title">Parecer Geral da Vela</div>
        <div class="resultado-value">Ótimo estado - Revisar a cada 100h ou 1 ano</div>
      </div>

      <div class="observacoes">
        <strong>Observações Adicionais:</strong><br>
        ${laudo.observacoes}
      </div>

      <div class="footer-text">
        Documento gerado digitalmente em ${laudo.dataEmissao} | Cia. do Ar
      </div>
    </div>
  </div>

</body>
</html>
`;

async function main() {
  console.log('Iniciando geração do Laudo Fictício...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Salvar no Desktop do usuário
  const desktopDir = path.join(os.homedir(), 'Desktop');
  const outputPdf = path.join(desktopDir, 'Laudo_Ficticio_João_Voador.pdf');

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  await browser.close();
  console.log('PDF gerado com sucesso em:', outputPdf);
}

main().catch(console.error);
