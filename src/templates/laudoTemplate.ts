import { LaudoParapente } from '../types/laudo';
import { PARECER_GERAL_LABELS, PARECER_GERAL_COLORS } from '../types/constants';
import { imageToBase64 } from '../services/imageService';

export async function generateLaudoHtml(laudo: LaudoParapente): Promise<string> {
  let fotoBase64 = '';
  if (laudo.fotoUri) {
    try {
      fotoBase64 = await imageToBase64(laudo.fotoUri);
    } catch (e) {
      console.warn('Não foi possível converter a foto para base64', e);
    }
  }

  const resultColor = PARECER_GERAL_COLORS[laudo.parecerGeral] ?? '#374151';
  const resultLabel = PARECER_GERAL_LABELS[laudo.parecerGeral];
  const resultIcon = {
    OTIMO: '✅',
    MUITO_BOM: '✅',
    USADO_BOM_ESTADO: '🟡',
    USADO_RAZOAVEL: '⚠️',
    MUITO_USADO: '🔶',
    CONDENADO: '🚫',
  }[laudo.parecerGeral] ?? '📋';

  const formatDate = (val: string) => {
    try {
      const p = val.split('-');
      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    } catch {}
    return val;
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'Ok' || status === 'Correto') {
      return `<span style="display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">✓ Ok</span>`;
    }
    if (status === 'Não Ok' || status === 'Incorreto') {
      return `<span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">✕ Não Ok</span>`;
    }
    return `<span style="display: inline-block; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">${status}</span>`;
  };

  const renderObs = (obs: string) => {
    if (!obs || obs.trim() === '') return '';
    return `<div style="font-size: 9px; color: #64748b; margin-top: 3px; font-weight: 500; line-height: 1.2;">Obs: ${obs}</div>`;
  };

  const logoWatermarkHtml = `
    <div style="text-align:center; line-height:1;">
      <svg width="900" height="115" viewBox="0 0 240 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 18px;">
        <path d="M 10 28 C 60 2, 180 2, 230 28 C 175 14, 65 14, 10 28 Z" fill="#e5007d" />
      </svg>
      <div style="font-family:'Arial Black',Arial,sans-serif; font-size:160px; font-weight:900; color:#1b2a6b; letter-spacing:-3px;">
        <span style="font-style:italic;">Cia.</span> do Ar
      </div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Laudo ${laudo.numeroLaudo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1e293b;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
    }

    @page {
      size: A4 portrait;
      margin: 5mm;
    }

    .pdf-page {
      position: relative;
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 8mm 16mm;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    }

    .pdf-page:last-of-type {
      page-break-after: auto;
    }

    /* MARCA D'ÁGUA INDIVIDUAL POR PÁGINA */
    .page-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      width: 1400px;
      opacity: 0.05;
      z-index: 0;
      pointer-events: none;
    }

    .page-content {
      position: relative;
      z-index: 1;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 12px;
      border-bottom: 3px solid #db2777;
      margin-top: 5px;
      margin-bottom: 20px;
    }

    .brand-section h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }
    .brand-section h2 {
      font-size: 14px;
      font-weight: 700;
      color: #db2777;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .contact-section {
      text-align: right;
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
    }
    .contact-section strong {
      color: #0f172a;
      font-size: 11px;
    }

    /* AVOID PAGE BREAKS IN BLOCKS */
    .keep-together {
      page-break-inside: avoid;
      break-inside: avoid;
      padding-top: 10px;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* SECTION TITLE */
    .section-title {
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
      background: linear-gradient(90deg, #0f172a 0%, #1e3a5f 100%);
      padding: 7px 12px 7px 16px;
      border-radius: 0 6px 6px 0;
      margin-top: 15px;
      margin-bottom: 8px;
      margin-left: -4px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-left: 5px solid #db2777;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.12);
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 6px 9px;
      text-align: left;
    }

    table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    
    th {
      background-color: #f1f5f9;
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      width: 25%;
    }
    
    td {
      font-size: 11px;
      font-weight: 500;
      color: #0f172a;
    }

    /* FOTO MOLDURA */
    .foto-card {
      margin-top: 15px;
      margin-bottom: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
    }
    .foto-header {
      background-color: #f1f5f9;
      color: #475569;
      font-size: 9px;
      font-weight: 700;
      padding: 5px 10px;
      border-bottom: 1px solid #e2e8f0;
      letter-spacing: 0.5px;
    }
    .foto-body {
      padding: 10px;
      text-align: center;
      background: #ffffff;
    }
    .foto-body img {
      max-width: 100%;
      max-height: 220px;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }

    /* RESULTADO */
    .resultado-banner {
      margin-top: 20px;
      background: linear-gradient(135deg, ${resultColor}15 0%, ${resultColor}08 100%);
      border: 2px solid ${resultColor};
      border-radius: 12px;
      padding: 20px 15px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .resultado-banner::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #db2777, ${resultColor});
    }
    .resultado-icon {
      font-size: 48px;
      line-height: 1;
      margin-bottom: 8px;
      display: block;
    }
    .resultado-title {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .resultado-value {
      font-size: 22px;
      font-weight: 900;
      color: ${resultColor};
      letter-spacing: -0.5px;
    }

    .observacoes {
      margin-top: 15px;
      padding: 12px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 11px;
      color: #334155;
    }

    /* FOOTER */
    .footer {
      position: fixed;
      bottom: 8mm;
      left: 16mm;
      right: 16mm;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      z-index: 10;
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1 -->
  <div class="pdf-page">
    <div class="page-watermark">${logoWatermarkHtml}</div>
    <div class="page-content">
      
      <!-- HEADER -->
      <div class="header">
        <div class="brand-section">
          <svg width="180" height="62" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin-bottom: 4px;">
            <path d="M 25 32 C 70 5, 180 5, 215 32 C 175 16, 70 16, 25 32 Z" fill="#e5007d" />
            <text x="120" y="68" font-family="'Inter', 'Arial Black', sans-serif" text-anchor="middle">
              <tspan font-weight="900" font-style="italic" font-size="36" fill="#1b2a6b">Cia.</tspan>
              <tspan font-weight="800" font-style="normal" font-size="36" fill="#1b2a6b"> do Ar</tspan>
            </text>
          </svg>
          <h2>LAUDO DE REVISÃO DE PARAPENTE</h2>
        </div>
        <div class="contact-section">
          <strong>@ciadoar</strong><br>
          (51) 98436-209<br>
          Laudo Nº: <strong>${laudo.numeroLaudo}</strong>
        </div>
      </div>

      <!-- PROPRIETÁRIO -->
      <div class="keep-together">
        <div class="section-title">👤 Dados do Proprietário</div>
        <table>
          <tr>
            <th>Nome</th>
            <td colspan="3">${laudo.nomeProprietario}</td>
          </tr>
          <tr>
            <th>Data da Revisão</th>
            <td>${formatDate(laudo.dataEmissao)}</td>
            <th>Telefone</th>
            <td>${laudo.telefone}</td>
          </tr>
          <tr>
            <th>Cidade</th>
            <td>${laudo.cidade || (laudo.cidadeEstado ? laudo.cidadeEstado.split('-')[0].trim() : '-')}</td>
            <th>Estado (UF)</th>
            <td>${laudo.estado || (laudo.cidadeEstado && laudo.cidadeEstado.includes('-') ? laudo.cidadeEstado.split('-')[1].trim() : '-')}</td>
          </tr>
          <tr>
            <th>Endereço</th>
            <td>${laudo.endereco}</td>
            <th>Email</th>
            <td>${laudo.email}</td>
          </tr>
        </table>
      </div>

      <!-- VELA -->
      <div class="keep-together">
        <div class="section-title">🪂 Identificação da Vela</div>
        <table>
          <tr>
            <th>Fábrica / Modelo</th>
            <td colspan="3">${laudo.fabricaModelo}</td>
          </tr>
          <tr>
            <th>Nº de Série</th>
            <td>${laudo.numeroSerie}</td>
            <th>Data de Fabricação</th>
            <td>${laudo.dataFabricacao}</td>
          </tr>
          <tr>
            <th>Cor Bordo de Ataque</th>
            <td>${laudo.corBordoAtaque}</td>
            <th>Cor Intradorso</th>
            <td>${laudo.corIntradorso}</td>
          </tr>
          <tr>
            <th>Cor Extradorso</th>
            <td colspan="3">${laudo.corExtradorso}</td>
          </tr>
        </table>
      </div>

      ${fotoBase64 ? `
      <div class="foto-card keep-together">
        <div class="foto-header">📷 REGISTRO FOTOGRÁFICO DO EQUIPAMENTO</div>
        <div class="foto-body">
          <img src="${fotoBase64}" alt="Foto da vela" />
        </div>
      </div>
      ` : ''}

    </div>
  </div>

  <!-- PÁGINA 2 -->
  <div class="pdf-page">
    <div class="page-watermark">${logoWatermarkHtml}</div>
    <div class="page-content">

      <!-- LINHAS -->
      <div class="keep-together" style="margin-top: 15px;">
        <div class="section-title">🧵 Checagem de Linhas</div>
        <table>
          <tr><th>Tirantes</th><td>
            ${renderStatusBadge(laudo.linhasTirantes)}
            ${renderObs(laudo.linhasTirantesObs)}
          </td></tr>
          <tr><th>Batoques e Argolas</th><td>
            ${renderStatusBadge(laudo.linhasBatoquesArgolas)}
            ${renderObs(laudo.linhasBatoquesArgolasObs)}
          </td></tr>
          <tr><th>Roldanas</th><td>
            ${renderStatusBadge(laudo.linhasRoldanas)}
            ${renderObs(laudo.linhasRoldanasObs)}
          </td></tr>
          <tr><th>Distorcedor</th><td>
            ${renderStatusBadge(laudo.linhasDistorcedor)}
            ${renderObs(laudo.linhasDistorcedorObs)}
          </td></tr>
          <tr><th>Carga nas Linhas</th><td>
            ${renderStatusBadge(laudo.linhasCarga)}
            ${renderObs(laudo.linhasCargaObs)}
          </td></tr>
          <tr><th>Troca de Linhas</th><td>
            ${renderStatusBadge(laudo.linhasTroca)}
            ${renderObs(laudo.linhasTrocaObs)}
          </td></tr>
          <tr><th>Simetria e Trimagem</th><td>
            ${renderStatusBadge(laudo.linhasSimetriaTrimagem)}
            ${renderObs(laudo.linhasSimetriaTrimagemObs)}
          </td></tr>
        </table>
      </div>

      <!-- TECIDO -->
      <div class="keep-together" style="margin-top: 15px;">
        <div class="section-title">🛡️ Checagem do Tecido</div>
        <table>
          <tr><th>Check do Perfil</th><td>
            ${renderStatusBadge(laudo.tecidoCheckPerfil)}
            ${renderObs(laudo.tecidoCheckPerfilObs)}
          </td></tr>
          <tr><th>Check do Intradorso</th><td>
            ${renderStatusBadge(laudo.tecidoCheckIntradorso)}
            ${renderObs(laudo.tecidoCheckIntradorsoObs)}
          </td></tr>
          <tr><th>Check do Bordo Ataque</th><td>
            ${renderStatusBadge(laudo.tecidoCheckBordoAtaque)}
            ${renderObs(laudo.tecidoCheckBordoAtaqueObs)}
          </td></tr>
          <tr><th>Check do Extradorso</th><td>
            ${renderStatusBadge(laudo.tecidoCheckExtradorso)}
            ${renderObs(laudo.tecidoCheckExtradorsoObs)}
          </td></tr>
          <tr><th>Teste de Resistência</th><td>
            ${renderStatusBadge(laudo.tecidoTesteResistencia)}
          </td></tr>
          <tr><th>Porosidade Bordo Ataque</th><td>
            ${renderStatusBadge(laudo.tecidoPorosidadeBordoAtaque)}
          </td></tr>
          <tr><th>Porosidade Intradorso</th><td>
            ${renderStatusBadge(laudo.tecidoPorosidadeIntradorso)}
          </td></tr>
          <tr><th>Porosidade Extradorso</th><td>
            ${renderStatusBadge(laudo.tecidoPorosidadeExtradorso)}
          </td></tr>
        </table>
      </div>

      <!-- RESULTADO E PARECER -->
      <div class="keep-together">
        <div class="resultado-banner">
          <span class="resultado-icon">${resultIcon}</span>
          <div class="resultado-title">Parecer Geral da Vela</div>
          <div class="resultado-value">${resultLabel}</div>
        </div>

        ${laudo.observacoes ? `
        <div class="observacoes">
          <strong>Observações Adicionais:</strong><br/>
          ${laudo.observacoes}
        </div>
        ` : ''}
      </div>

    </div>
  </div>

  <div class="footer">
    Documento gerado digitalmente em ${formatDate(laudo.dataEmissao)} | Cia. do Ar
  </div>
</body>
</html>
  `;
}
