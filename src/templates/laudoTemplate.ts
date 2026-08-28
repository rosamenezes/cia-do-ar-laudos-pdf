import {
  LaudoParapente,
  PorosityGrid,
  PorosityMap,
  PorosityMapLegacy,
  isPorosityLegacy,
  intradorsoEstaAtivo,
} from '../types/laudo';
import {
  PARECER_GERAL_LABELS,
  PARECER_GERAL_COLORS,
  PARECER_POROSIMETRO_FAIXAS,
  PARECER_POROSIMETRO_SHORT_LABELS,
  PARECER_POROSIMETRO_COLORS,
  POROSIDADE_COLUNAS,
  POROSIDADE_COLUNA_X,
  POROSIDADE_PONTO_Y,
  POROSIDADE_VELA_PATH,
} from '../types/constants';
import { LOGO_BASE64 } from './logoAsset';
import { imageToBase64 } from '../services/imageService';
import { formatDateBR, formatMonthYearBR } from '../utils/date';
import { cidadeDoLaudo, estadoDoLaudo } from '../utils/localidade';


/** Mesmas coordenadas usadas pelo seletor da tela, para o laudo bater com o app */
const POROS_COLUNAS = POROSIDADE_COLUNAS;
const POROS_COLUNA_X = POROSIDADE_COLUNA_X;
const POROS_PONTO_Y = POROSIDADE_PONTO_Y;
const POROS_VELA_PATH = POROSIDADE_VELA_PATH;

function renderVelaSvg(grade: PorosityGrid): string {
  const pontos = grade
    .map((coluna, c) =>
      coluna
        .map((ponto, i) => {
          // No laudo impresso só entram os pontos efetivamente medidos. Na tela
          // os vazios continuam visíveis, porque são o alvo de toque do técnico.
          if (!ponto?.selected) return '';

          const cx = POROS_COLUNA_X[c];
          const cy = POROS_PONTO_Y[c][i];
          return `
            <circle cx="${cx}" cy="${cy}" r="6.5" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5" />
            <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" />`;
        })
        .join('')
    )
    .join('');

  const rotulos = POROS_COLUNAS.map(
    (nome, c) =>
      `<text x="${POROS_COLUNA_X[c]}" y="149" text-anchor="middle" font-size="9" font-weight="700" fill="#64748b">${nome}</text>`
  ).join('');

  return `
    <svg width="100%" viewBox="0 48 400 106" preserveAspectRatio="xMidYMid meet" style="display:block;height:auto;">
      <path d="${POROS_VELA_PATH}" fill="#ffffff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" />
      ${pontos}
      ${rotulos}
    </svg>`;
}

function renderTabelaPorosidade(
  extradorso: PorosityGrid,
  intradorso: PorosityGrid
): string {
  const linhas: string[] = [];

  const coletar = (grade: PorosityGrid, superficie: string) => {
    grade.forEach((coluna, c) =>
      coluna.forEach((ponto, i) => {
        if (!ponto?.selected) return;
        linhas.push(`
          <tr>
            <td class="poros-local">${superficie} · ${POROS_COLUNAS[c]} · Ponto ${i + 1}</td>
            <td class="poros-cor">${ponto.cor || '—'}</td>
            <td class="poros-valor">${ponto.value || '—'}</td>
          </tr>`);
      })
    );
  };

  coletar(extradorso, 'Extradorso');
  coletar(intradorso, 'Intradorso');

  if (linhas.length === 0) return '';

  const cabecalho = `
      <tr>
        <th class="poros-local">Ponto medido</th>
        <th class="poros-cor">Cor</th>
        <th class="poros-valor">Leitura</th>
      </tr>`;

  const tabela = (conteudo: string[]) =>
    `<table class="tabela-porosidade">${cabecalho}${conteudo.join('')}</table>`;

  // A grade permite até 30 pontos. Acima de 12 linhas a tabela sozinha
  // estouraria a folha, então quebramos em duas colunas lado a lado.
  if (linhas.length > 12) {
    const meio = Math.ceil(linhas.length / 2);
    return `
    <div class="poros-tabelas">
      <div class="poros-tabela-col">${tabela(linhas.slice(0, meio))}</div>
      <div class="poros-tabela-col">${tabela(linhas.slice(meio))}</div>
    </div>`;
  }

  return tabela(linhas);
}

/** Formato antigo (pontos nomeados), para os laudos já emitidos */
function renderPorosidadeLegado(porosidade: PorosityMapLegacy): string {
  const ext = Object.entries(porosidade.extradorso || {}).filter(([, v]) => v?.selected);
  const int = Object.entries(porosidade.intradorso || {}).filter(([, v]) => v?.selected);
  if (ext.length === 0 && int.length === 0) return '';

  const exLabels: Record<string, string> = {
    pontaEsquerda: 'Extradorso: Ponta Esq.',
    meioEsquerda: 'Extradorso: Meio Esq.',
    meioDireita: 'Extradorso: Meio Dir.',
    pontaDireita: 'Extradorso: Ponta Dir.',
  };
  const inLabels: Record<string, string> = {
    esquerda: 'Intradorso: Esquerda',
    centro: 'Intradorso: Centro',
    direita: 'Intradorso: Direita',
  };

  const linhas = [
    ...ext.map(([k, v]) => `<tr><td class="poros-local">${exLabels[k] ?? k}</td><td class="poros-valor">${v.value || '—'}</td></tr>`),
    ...int.map(([k, v]) => `<tr><td class="poros-local">${inLabels[k] ?? k}</td><td class="poros-valor">${v.value || '—'}</td></tr>`),
  ].join('');

  return `
    <div class="section-title">📊 MEDIÇÃO DE POROSIDADE</div>
    <table class="tabela-porosidade">
      <tr><th class="poros-local">Ponto medido</th><th class="poros-valor">Leitura (s)</th></tr>
      ${linhas}
    </table>`;
}

function renderPorosidadeMap(porosidade: PorosityMap | PorosityMapLegacy | undefined): string {
  if (!porosidade) return '';
  if (isPorosityLegacy(porosidade)) return renderPorosidadeLegado(porosidade);

  const ext = Array.isArray(porosidade.extradorso) ? porosidade.extradorso : [];
  // O intradorso só sai no laudo quando o técnico o incluiu. Desligado, os
  // pontos podem existir no documento, mas nem o desenho nem a tabela o mostram.
  const comIntradorso = intradorsoEstaAtivo(porosidade);
  const int = comIntradorso && Array.isArray(porosidade.intradorso) ? porosidade.intradorso : [];

  const algumMarcado = [...ext, ...int].some((coluna) =>
    (coluna ?? []).some((ponto) => ponto?.selected)
  );
  if (!algumMarcado) return '';

  const velaIntradorso = comIntradorso
    ? `
      <div class="poros-vela">
        <div class="poros-vela-titulo">INTRADORSO</div>
        ${renderVelaSvg(int)}
      </div>`
    : '';

  return `
    <div class="section-title">📊 MEDIÇÃO DE POROSIDADE</div>

    <div class="poros-velas${comIntradorso ? '' : ' poros-velas-unica'}">
      <div class="poros-vela">
        <div class="poros-vela-titulo">EXTRADORSO</div>
        ${renderVelaSvg(ext)}
      </div>
      ${velaIntradorso}
    </div>

    ${renderTabelaPorosidade(ext, int)}`;
}

export async function generateLaudoHtml(laudo: LaudoParapente): Promise<string> {
  const converterFoto = async (uri?: string) => {
    if (!uri) return '';
    try {
      return await imageToBase64(uri);
    } catch (e) {
      console.warn('Não foi possível converter a foto para base64', e);
      return '';
    }
  };

  const fotoBase64 = await converterFoto(laudo.fotoUri);
  const fotoSeloBase64 = await converterFoto(laudo.fotoSeloUri);

  const fotosAdicionais = (
    await Promise.all(
      (laudo.fotosAdicionais ?? []).map(async (foto) => ({
        base64: await converterFoto(foto.uri),
        descricao: foto.descricao ?? '',
      }))
    )
  ).filter((foto) => foto.base64);

  // Fila única na ordem em que as fotos aparecem no laudo.
  // As três primeiras ganham destaque (folha inteira / meia folha);
  // da quarta em diante vão para a grade de miniaturas.
  const filaFotos = [
    { base64: fotoBase64, titulo: '📷 REGISTRO FOTOGRÁFICO DO EQUIPAMENTO', legenda: '', selo: false },
    { base64: fotoSeloBase64, titulo: '🏷️ SELO DE INFORMAÇÕES DA VELA', legenda: '', selo: true },
    ...fotosAdicionais.map((foto, i) => ({
      base64: foto.base64,
      titulo: `🔍 REGISTRO COMPLEMENTAR ${i + 1}`,
      legenda: foto.descricao,
      selo: false,
    })),
  ].filter((foto) => foto.base64);

  const fotoFolhaInteira = filaFotos[0];
  const fotoMeiaA = filaFotos[1];
  const fotoMeiaB = filaFotos[2];
  const fotosMiniatura = filaFotos.slice(3);

  const renderFotoDestaque = (
    foto: { base64: string; titulo: string; legenda: string; selo?: boolean } | undefined,
    classe: string
  ) => {
    if (!foto) return '';
    return `
      <div class="foto-card ${classe}${foto.selo ? ' foto-selo' : ''}">
        <div class="foto-header">${foto.titulo}</div>
        <div class="foto-body">
          <img src="${foto.base64}" alt="${foto.titulo}" />
        </div>
        ${foto.legenda ? `<div class="foto-legenda">${foto.legenda}</div>` : ''}
      </div>
    `;
  };

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

  const formatDate = (val: string) => formatDateBR(val);

  const renderStatusBadge = (status: string) => {
    if (status === 'Ok' || status === 'Correto') {
      return `<span style="display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">✓ Ok</span>`;
    }
    if (status === 'Não Ok' || status === 'Incorreto') {
      return `<span style="display: inline-block; color: #dc2626; font-size: 16px; font-weight: 800; line-height: 1;">✕</span>`;
    }
    return `<span style="display: inline-block; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">${status}</span>`;
  };

  /**
   * Tabela da escala do porosímetro, com a faixa escolhida destacada.
   * O laudo mostra a escala inteira para o piloto entender onde a vela caiu.
   */
  const renderParecerPorosimetro = (valor: string) => {
    const faixas = Object.keys(PARECER_POROSIMETRO_FAIXAS) as (keyof typeof PARECER_POROSIMETRO_FAIXAS)[];
    const escolhido = faixas.includes(valor as any) ? valor : '';

    // Laudo antigo com texto livre: mostra o que foi digitado, sem a escala
    if (!escolhido) {
      if (!valor || !valor.trim()) return '';
      return `
      <div class="section-title">🏭 Parecer do Fabricante</div>
      <table><tr><th>Conforme fabricante</th><td>${valor}</td></tr></table>
      `;
    }

    const linhas = faixas
      .map((chave) => {
        const ativa = chave === escolhido;
        const cor = PARECER_POROSIMETRO_COLORS[chave];
        return `
        <tr class="${ativa ? 'faixa-ativa' : ''}">
          <td class="faixa-marca">${ativa ? `<span style="color:${cor};font-weight:800;">●</span>` : ''}</td>
          <td class="faixa-valor" style="${ativa ? `color:${cor};font-weight:800;` : ''}">${PARECER_POROSIMETRO_FAIXAS[chave]}</td>
          <td class="faixa-texto" style="${ativa ? `color:${cor};font-weight:700;` : ''}">${PARECER_POROSIMETRO_SHORT_LABELS[chave]}</td>
        </tr>`;
      })
      .join('');

    return `
      <div class="section-title">🏭 Parecer do Fabricante — Leitura do Porosímetro</div>
      <table class="tabela-porosimetro">
        <tr>
          <th class="faixa-marca"></th>
          <th class="faixa-valor">Leitura</th>
          <th class="faixa-texto">Classificação do fabricante</th>
        </tr>
        ${linhas}
      </table>
    `;
  };

  const renderObs = (obs: string) => {
    if (!obs || obs.trim() === '') return '';
    return `<div style="font-size: 9px; color: #64748b; margin-top: 3px; font-weight: 500; line-height: 1.2;">Obs: ${obs}</div>`;
  };

  // Conteúdo da checagem técnica. Tem dois destinos possíveis: a metade de baixo
  // da folha de fotos (quando só existem 2 fotos) ou uma folha própria.
  const conteudoChecagem = `
      <div class="section-title-continuacao">Checagem Técnica</div>
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
        
      </table>
  `;


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
      padding: 7px 12px 7px 20px !important;
    }
    
    td {
      font-size: 11px;
      font-weight: 500;
      color: #0f172a;
      padding: 7px 12px 7px 20px !important;
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
    /* FOLHA 1: a foto ocupa toda a altura que sobrar, sem empurrar página */
    .folha-com-foto .page-content {
      display: flex;
      flex-direction: column;
      /* altura definida (não mínima): é o que permite ao flex:1 da foto
         esticar para ocupar exatamente o espaço que sobra da folha */
      height: 220mm;
    }
    .foto-preenche {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .foto-preenche .foto-body,
    .foto-meia .foto-body {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .foto-preenche .foto-body img,
    .foto-meia .foto-body img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    /* FOLHA DE FOTOS: cada destaque ocupa metade da altura útil */
    /* Duas destas precisam caber no orçamento de 240mm da folha
       (o mesmo limite que o commit a40c182c fixou para não gerar
       folha em branco na impressão do iOS). */
    .foto-meia {
      height: 100mm;
      display: flex;
      flex-direction: column;
      margin-bottom: 5mm;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .foto-meia:last-child {
      margin-bottom: 0;
    }
    /* O selo costuma ser um retrato e enchia os 100mm inteiros, saindo maior
       que a própria foto do equipamento. 30% menor devolve a proporção e
       ainda libera espaço na folha. */
    .foto-meia.foto-selo {
      height: 70mm;
    }
    .foto-legenda {
      padding: 5px 10px;
      font-size: 9px;
      color: #475569;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      line-height: 1.35;
    }

    /* Título da checagem quando ela continua na metade de baixo da folha */
    .section-title-continuacao {
      background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
      color: #ffffff;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-left: 4px solid #db2777;
      border-radius: 3px;
      margin: 0 0 8px 0;
    }

    /* MAPA DE POROSIDADE */
    .poros-velas {
      display: flex;
      flex-direction: column; /* empilhadas e em largura cheia, como na ficha de oficina */
      gap: 6px;
      margin: 8px 0 10px 0;
    }
    .poros-vela {
      width: 72%; /* dimensionada para as duas velas + tabelas caberem nos 240mm */
      margin: 0 auto;
    }
    /* Só o extradorso: sobra folha, então o desenho vem maior */
    .poros-velas-unica .poros-vela {
      width: 86%;
    }
    .poros-vela-titulo {
      font-size: 10px;
      font-weight: 800;
      color: #1e293b;
      text-align: center;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .poros-tabelas {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .poros-tabela-col {
      flex: 1;
      min-width: 0;
    }
    /* Mais específico que .tabela-porosidade, senão a regra abaixo prevalece */
    .poros-tabelas .tabela-porosidade .poros-cor {
      width: 56px !important;
    }
    .poros-tabelas .tabela-porosidade .poros-valor {
      width: 46px !important;
    }
    .poros-tabelas .tabela-porosidade td,
    .poros-tabelas .tabela-porosidade th {
      font-size: 8px !important;
      padding: 2px 5px !important;
      line-height: 1.25 !important;
    }
    .tabela-porosidade {
      table-layout: fixed;
    }
    .tabela-porosidade td,
    .tabela-porosidade th {
      padding: 5px 10px !important;
      font-size: 10px;
    }
    .tabela-porosidade .poros-local {
      width: auto !important;
      font-weight: 700;
      color: #1e293b;
    }
    .tabela-porosidade .poros-cor {
      width: 110px !important;
      color: #475569;
    }
    .tabela-porosidade .poros-valor {
      width: 80px !important;
      text-align: center;
      font-weight: 800;
      color: #db2777;
    }
    .tabela-porosidade th {
      padding-left: 10px !important;
      color: #475569;
      font-weight: 700;
    }

    /* TABELA DA ESCALA DO POROSÍMETRO */
    .tabela-porosimetro {
      table-layout: fixed; /* o th global tem width:25%, que desalinha as colunas */
    }
    .tabela-porosimetro td,
    .tabela-porosimetro th {
      padding: 6px 10px !important;
      font-size: 10px;
    }
    .tabela-porosimetro .faixa-marca {
      width: 22px !important;
      text-align: center;
      padding-left: 8px !important;
      padding-right: 0 !important;
    }
    .tabela-porosimetro .faixa-valor {
      width: 92px !important;
      font-weight: 700;
      color: #334155;
    }
    .tabela-porosimetro td.faixa-valor {
      white-space: nowrap;
    }
    .tabela-porosimetro th {
      padding-left: 10px !important;
    }
    .tabela-porosimetro .faixa-texto {
      width: auto !important;
      color: #475569;
    }
    .tabela-porosimetro tr.faixa-ativa td {
      background: #fdf2f8;
    }

    /* GRADE DE FOTOS COMPLEMENTARES */
    .fotos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .foto-extra {
      width: calc(50% - 5px);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .foto-extra img {
      width: 100%;
      height: 82px;
      object-fit: cover;
      display: block;
    }
    .foto-extra-legenda {
      padding: 6px 8px;
      font-size: 9px;
      color: #475569;
      line-height: 1.35;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .foto-extra-legenda strong {
      color: #db2777;
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
      padding: 32px 24px;
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
      font-size: 64px;
      line-height: 1;
      margin-bottom: 8px;
      display: block;
    }
    .resultado-title {
      font-size: 16px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .resultado-value {
      font-size: 32px;
      font-weight: 900;
      color: ${resultColor};
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }

    .observacoes {
      margin-top: 12px;
      padding: 14px 18px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.6;
    }
    .observacoes strong {
      font-size: 13px;
      color: #0f172a;
      display: block;
      margin-bottom: 4px;
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
  <div class="pdf-page${fotoFolhaInteira ? ' folha-com-foto' : ''}">
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
          <td>${cidadeDoLaudo(laudo)}</td>
          <th>Estado (UF)</th>
          <td>${estadoDoLaudo(laudo)}</td>
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
          <td>${formatMonthYearBR(laudo.dataFabricacao)}</td>
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

      <!-- FOTO 1 — preenche todo o espaço restante da folha -->
      ${renderFotoDestaque(fotoFolhaInteira, 'foto-preenche')}

    </div>
  </div>

  ${
    fotoMeiaA
      ? `
  <!-- ════════════════════════════════════════
       FOLHA DE FOTOS — 2ª (metade de cima) e 3ª (metade de baixo).
       Sem a 3ª foto, o laudo retoma na metade de baixo desta folha.
       ════════════════════════════════════════ -->
  <div class="pdf-page page-break">
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>

    <div class="page-content">
      <div class="page-subheader">
        <span class="page-subheader-title">Registro Fotográfico</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      ${renderFotoDestaque(fotoMeiaA, 'foto-meia')}
      ${fotoMeiaB ? renderFotoDestaque(fotoMeiaB, 'foto-meia') : conteudoChecagem}
    </div>
  </div>
  `
      : ''
  }

  ${
    fotoMeiaA && !fotoMeiaB
      ? '' /* já saiu na metade de baixo da folha de fotos */
      : `
  <!-- ════════════════════════════════════════
       CHECAGEM TÉCNICA — folha própria
       (precedida pelas miniaturas, quando há 4+ fotos)
       ════════════════════════════════════════ -->
  <div class="pdf-page page-break">
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>

    <div class="page-content">
      <div class="page-subheader">
        <span class="page-subheader-title">Checagem Técnica</span>
        <span class="page-subheader-info">Laudo Nº ${laudo.numeroLaudo} • ${laudo.nomeProprietario}</span>
      </div>

      ${
        fotosMiniatura.length > 0
          ? `
      <div class="section-title">🔍 Demais Registros Fotográficos</div>
      <div class="fotos-grid">
        ${fotosMiniatura
          .map(
            (foto, i) => `
          <div class="foto-extra">
            <img src="${foto.base64}" alt="Registro ${i + 4}" />
            <div class="foto-extra-legenda">
              <strong>Foto ${i + 4}</strong>${foto.legenda ? ` — ${foto.legenda}` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${conteudoChecagem}
    </div>
  </div>
  `
  }

  <!-- ════════════════════════════════════════
       PÁGINA 3 — Medição de Porosidade  <!-- ════════════════════════════════════════
       PÁGINA 3 — Medição de Porosidade
       ════════════════════════════════════════ -->
  ${laudo.porosidade ? `
  <div class="pdf-page page-break">
    <div class="global-watermark">
      <img src="${LOGO_BASE64}" style="width: 100%; height: auto; display: block;" />
    </div>
    <div class="page-content">
      <div class="page-subheader">
        <span class="page-subheader-title">Laudo de Revisão</span>
      </div>
      ${renderPorosidadeMap(laudo.porosidade)}
    </div>
  </div>
  ` : ''}

  <!-- ════════════════════════════════════════
       PÁGINA 4 — Parecer Geral + Rodapé
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

      ${renderParecerPorosimetro(laudo.parecerConformeFabricante)}

      <!-- PARECER GERAL -->
      <div class="resultado-banner">
        <div class="selo-qualidade" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #ecfdf5; width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 20px; font-weight: bold;">✓</div>
          <div style="text-align: left;">
            <div style="font-size: 13px; font-weight: 900; color: #1e293b; letter-spacing: 0.3px;">INSPEÇÃO CERTIFICADA</div>
            <div style="font-size: 9px; font-weight: 600; color: #64748b; margin-top: 2px;">Cia. do Ar • Padrão de Qualidade</div>
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
