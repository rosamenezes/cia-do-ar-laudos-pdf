import { LaudoParapente } from '../types/laudo';
import { PARECER_GERAL_LABELS, PARECER_GERAL_COLORS } from '../types/constants';
import { LOGO_BASE64 } from './logoAsset';
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
  const resultIcon =
    {
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
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 680px; max-width: 95%; height: auto; display: block; margin: 0 auto;" />
    </div>
  `;

  return `
<div class="laudo-print-container">
  <style>
    .laudo-print-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #1e293b;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
    }
    .laudo-print-container * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4 portrait;
      margin: 2mm;
    }

    .pdf-page {
      position: relative;
      width: 100%;
      max-width: 210mm;
      min-height: 240mm; /* Ajustado para 240mm para caber na área de impressão segura do iOS */
      margin: 0 auto;
      padding: 5mm 10mm 15mm 10mm;
      box-sizing: border-box;
    }
    
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* SELO DE QUALIDADE PREMIUM */
    .selo-qualidade {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 5;
    }

    /* MARCA D'ÁGUA GLOBAL */
    .global-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: 700px;
      opacity: 0.12;
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
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
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
      margin-top: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }
    .foto-header {
      background: #f8fafc;
      padding: 4px 10px;
      font-weight: 700;
      font-size: 9px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .foto-body {
      padding: 6px;
      text-align: center;
      background: #ffffff;
    }
    .foto-body img {
      max-width: 100%;
      max-height: 250px;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }

    /* RESULTADO */
    .resultado-banner {
      margin-top: 12px;
      background: linear-gradient(135deg, ${resultColor}15 0%, ${resultColor}08 100%);
      border: 2px solid ${resultColor};
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .resultado-banner::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #db2777, ${resultColor});
    }
    .resultado-icon {
      font-size: 48px;
      line-height: 1;
      margin-bottom: 4px;
      display: block;
    }
    .resultado-title {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .resultado-value {
      font-size: 24px;
      font-weight: 900;
      color: ${resultColor};
      letter-spacing: -0.5px;
    }

    .observacoes {
      margin-top: 8px;
      padding: 8px 12px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 10px;
      color: #334155;
    }

    /* BOTTOM SECTION */
    .fixed-bottom-section {
      margin-top: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .footer-text {
      padding-top: 8px;
      margin-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
    }
  </style>

  <!-- ════════════════════════════════════════
       PÁGINA 1 — Dados + Identificação + Foto
       ════════════════════════════════════════ -->
  <div class="pdf-page">
    <!-- MARCA D'ÁGUA INDIVIDUAL DA PÁGINA -->
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>

    <div class="page-content">

      <!-- HEADER -->
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

      <!-- PROPRIETÁRIO -->
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

      <!-- VELA -->
      <div class="section-title">🪂 Identificação da Vela</div>
      <table>
        <tr>
          <th>Fábrica / Modelo</th>
          <td colspan="3"><strong>${laudo.fabricaModelo}</strong></td>
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

      <!-- FOTO -->
      ${
        fotoBase64
          ? `
      <div class="foto-card">
        <div class="foto-header">📷 REGISTRO FOTOGRÁFICO DO EQUIPAMENTO</div>
        <div class="foto-body">
          <img src="${fotoBase64}" alt="Foto da vela" />
        </div>
      </div>
      `
          : ''
      }

    </div>
  </div>

  <!-- ════════════════════════════════════════
       PÁGINA 2 — Checagem de Linhas e Tecido
       ════════════════════════════════════════ -->
  <div class="pdf-page page-break">
    <!-- MARCA D'ÁGUA INDIVIDUAL DA PÁGINA -->
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>

    <div class="page-content">

      <!-- Subheader -->
      <div class="page-subheader">
        <span class="page-subheader-title">Checagem Técnica</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      <!-- LINHAS -->
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
        <tr><th>Simetria</th><td>
          ${renderStatusBadge(laudo.linhasSimetria)}
          ${renderObs(laudo.linhasSimetriaObs)}
        </td></tr>
        <tr><th>Trimagem</th><td>
          ${renderStatusBadge(laudo.linhasTrimagem)}
          ${renderObs(laudo.linhasTrimagemObs)}
        </td></tr>
      </table>

      <!-- TECIDO -->
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
        <tr><th>Porosidade Extradorso</th><td>
          ${renderStatusBadge(laudo.tecidoPorosidadeExtradorso)}
        </td></tr>
      </table>

    </div>
  </div>

  <!-- ════════════════════════════════════════
       PÁGINA 3 — Parecer Geral + Rodapé
       ════════════════════════════════════════ -->
  <div class="pdf-page page-break">
    <!-- MARCA D'ÁGUA INDIVIDUAL DA PÁGINA -->
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>

    <div class="page-content">

      <!-- Subheader -->
      <div class="page-subheader">
        <span class="page-subheader-title">Parecer Final</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      <!-- PARECER GERAL -->
      <div class="resultado-banner">
        <div class="selo-qualidade" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
          <div style="background: #ecfdf5; width: 22px; height: 22px; border-radius: 11px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 14px; font-weight: bold;">✓</div>
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #1e293b; letter-spacing: 0.2px;">INSPEÇÃO CERTIFICADA</div>
            <div style="font-size: 7px; font-weight: 500; color: #64748b;">Cia. do Ar • Padrão de Qualidade</div>
          </div>
        </div>
        <span class="resultado-icon">${resultIcon}</span>
        <div class="resultado-title">Parecer Geral da Vela</div>
        <div class="resultado-value">${resultLabel}</div>
      </div>

      ${
        laudo.observacoes
          ? `
      <div class="observacoes">
        <strong>Observações Adicionais:</strong><br/>
        ${laudo.observacoes}
      </div>
      `
          : ''
      }

      <div class="footer-text">
        Documento gerado digitalmente em ${formatDate(laudo.dataEmissao)} | Cia. do Ar
      </div>

    </div>
  </div>

      </div>
    </div>
  </div>
</div>
  `;
}
