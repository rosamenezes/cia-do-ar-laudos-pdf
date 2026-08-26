import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../../src/types/laudo';
import { formatDateBR, formatMonthYearBR } from '../../src/utils/date';
import { getLaudoById, deleteLaudo } from '../../src/services/database';
import { confirmar, notificar } from '../../src/utils/feedback';
import { cidadeDoLaudo, estadoDoLaudo } from '../../src/utils/localidade';
import { medicoesDePorosidade } from '../../src/utils/porosidade';
import { generatePdfHtml, generatePdfBlob } from '../../src/services/pdfGenerator';
import {
  PARECER_GERAL_LABELS,
  PARECER_GERAL_COLORS,
  PARECER_GERAL_SHORT_LABELS,
  PARECER_POROSIMETRO_LABELS,
} from '../../src/types/constants';

// Função pura fora do componente — não recriada a cada render
function formatDate(iso: string): string {
  return formatDateBR(iso) || '-';
}

const GOOD_PARECERES = new Set(['OTIMO', 'MUITO_BOM', 'USADO_BOM_ESTADO']);

export default function LaudoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [laudo, setLaudo] = useState<LaudoParapente | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [printHtml, setPrintHtml] = useState<string | null>(null);

  const loadLaudo = useCallback(async () => {
    try {
      const data = await getLaudoById(id);
      setLaudo(data);
    } catch (e) {
      console.error('Erro ao carregar laudo:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadLaudo();
    }, [loadLaudo])
  );

  const handleOpenPrintView = async () => {
    if (!laudo) return;
    try {
      setGeneratingPdf(true);
      const html = await generatePdfHtml(laudo);
      setPrintHtml(html);
    } catch (e: any) {
      notificar('Erro ao processar visualização', e.message ?? '');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmar(
      'Excluir Laudo',
      `Deseja excluir o laudo ${laudo?.numeroLaudo}? Esta ação não pode ser desfeita.`,
      { rotuloConfirmar: 'Excluir', destrutivo: true }
    );
    if (!ok) return;

    await deleteLaudo(laudo!.id);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#db2777" />
      </View>
    );
  }

  if (!laudo) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Laudo não encontrado</Text>
      </View>
    );
  }

  const resultColor = PARECER_GERAL_COLORS[laudo.parecerGeral];
  const resultLabel = PARECER_GERAL_SHORT_LABELS[laudo.parecerGeral];
  const medicoes = medicoesDePorosidade(laudo.porosidade);
  const parecerIcon = GOOD_PARECERES.has(laudo.parecerGeral)
    ? 'checkmark-circle'
    : laudo.parecerGeral === 'CONDENADO'
      ? 'close-circle'
      : 'alert-circle';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !printHtml,
          title: laudo.numeroLaudo,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              style={{
                marginLeft: 4,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#1e293b" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity
                onPress={() => router.push(`/laudo/${laudo.id}/editar`)}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="create-outline" size={22} color="#db2777" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  marginRight: 4,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 40 : Math.max(40, insets.bottom + 20) },
        ]}
      >
        {/* Resultado Banner */}
        <View
          style={[
            styles.resultBanner,
            { backgroundColor: resultColor + '1a', borderColor: resultColor },
          ]}
        >
          <Ionicons name={parecerIcon} size={28} color={resultColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.resultLabel, { color: resultColor }]}>{resultLabel}</Text>
            <Text style={styles.resultSub}>
              {laudo.numeroLaudo} · {formatDate(laudo.dataEmissao)}
            </Text>
          </View>
        </View>

        {/* Fotos */}
        {laudo.fotoUri && (
          <Image source={{ uri: laudo.fotoUri }} style={styles.foto} resizeMode="cover" />
        )}

        {laudo.fotoSeloUri && (
          <View>
            <Text style={styles.fotoLegenda}>🏷️ Selo de informações</Text>
            <Image source={{ uri: laudo.fotoSeloUri }} style={styles.foto} resizeMode="cover" />
          </View>
        )}

        {laudo.fotosAdicionais && laudo.fotosAdicionais.length > 0 && (
          <InfoCard title="🔍 Fotos Complementares">
            {laudo.fotosAdicionais.map((foto, i) => (
              <View key={`${i}-${foto.uri.slice(-16)}`} style={styles.fotoExtraRow}>
                <Image source={{ uri: foto.uri }} style={styles.fotoExtraThumb} resizeMode="cover" />
                <Text style={styles.fotoExtraDesc}>
                  {foto.descricao || `Foto ${i + 1}`}
                </Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/* Info Cards */}
        <InfoCard title="👤 Proprietário">
          <InfoRow label="Nome" value={laudo.nomeProprietario} />
          <InfoRow label="Cidade" value={cidadeDoLaudo(laudo)} />
          <InfoRow label="Estado (UF)" value={estadoDoLaudo(laudo)} />
          <InfoRow label="Telefone" value={laudo.telefone} />
          <InfoRow label="Endereço" value={laudo.endereco} />
          <InfoRow label="E-mail" value={laudo.email} />
        </InfoCard>

        <InfoCard title="🪂 Vela">
          <InfoRow label="Fábrica/Modelo" value={laudo.fabricaModelo} />
          <InfoRow label="Nº Série" value={laudo.numeroSerie} />
          <InfoRow label="Fabricação" value={formatMonthYearBR(laudo.dataFabricacao)} />
          <InfoRow label="Cor Bordo Ataque" value={laudo.corBordoAtaque} />
          <InfoRow label="Cor Intradorso" value={laudo.corIntradorso} />
          <InfoRow label="Cor Extradorso" value={laudo.corExtradorso} />
        </InfoCard>

        <InfoCard title="🧵 Checagem de Linhas">
          <InfoRow label="Tirantes" value={laudo.linhasTirantes} />
          <InfoRow label="Batoques e Argolas" value={laudo.linhasBatoquesArgolas} />
          <InfoRow label="Roldanas" value={laudo.linhasRoldanas} />
          <InfoRow label="Distorcedor" value={laudo.linhasDistorcedor} />
          <InfoRow label="Carga nas Linhas" value={laudo.linhasCarga} />
          <InfoRow label="Troca de Linhas" value={laudo.linhasTroca} />
          <InfoRow label="Simetria" value={laudo.linhasSimetria} />
          <InfoRow label="Trimagem" value={laudo.linhasTrimagem} />
        </InfoCard>

        <InfoCard title="🛡️ Checagem do Tecido">
          <InfoRow label="Check do Perfil" value={laudo.tecidoCheckPerfil} />
          <InfoRow label="Check do Intradorso" value={laudo.tecidoCheckIntradorso} />
          <InfoRow label="Check do Bordo Ataque" value={laudo.tecidoCheckBordoAtaque} />
          <InfoRow label="Check do Extradorso" value={laudo.tecidoCheckExtradorso} />
          <View style={styles.divider} />
          <InfoRow label="Teste de Resistência" value={laudo.tecidoTesteResistencia} />
          <InfoRow label="Porosidade Bordo Ataque" value={laudo.tecidoPorosidadeBordoAtaque} />

          <InfoRow label="Porosidade Extradorso" value={laudo.tecidoPorosidadeExtradorso} />
          <View style={styles.divider} />
          <InfoRow
            label="Parecer do Fabricante"
            value={
              PARECER_POROSIMETRO_LABELS[
                laudo.parecerConformeFabricante as keyof typeof PARECER_POROSIMETRO_LABELS
              ] ?? laudo.parecerConformeFabricante
            }
          />
          {laudo.observacoes ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoLabel}>Observações:</Text>
              <Text style={styles.obsText}>{laudo.observacoes}</Text>
            </View>
          ) : null}
        </InfoCard>

        {medicoes.length > 0 && (
          <InfoCard title="📊 Medição de Porosidade">
            {medicoes.map((medicao) => (
              <InfoRow
                key={medicao.local}
                label={medicao.local}
                value={`${medicao.leitura}${medicao.cor !== '—' ? ` · ${medicao.cor}` : ''}`}
              />
            ))}
          </InfoCard>
        )}

        <InfoCard title="📋 Parecer Geral">
          <Text style={[styles.parecerText, { color: resultColor }]}>
            {PARECER_GERAL_LABELS[laudo.parecerGeral]}
          </Text>
        </InfoCard>

        {/* Ações */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#db2777' }]}
            onPress={handleOpenPrintView}
            disabled={generatingPdf}
            activeOpacity={0.8}
          >
            {generatingPdf ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="document-text-outline" size={20} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Gerar PDF (Compartilhar / Salvar)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Overlay do PDF para resolver o problema do Safari iOS PWA */}
      {printHtml && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: '#f8fafc',
          }}
        >
          <View
            style={{
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: 16,
              backgroundColor: '#1e293b',
            }}
          >
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                  💡 Para enviar pelo <Text style={{fontWeight: 'bold', color: '#fff'}}>WhatsApp</Text>: toque em Compartilhar e depois no <Text style={{fontWeight: 'bold', color: '#fff'}}>ícone ⇡</Text> do iPhone.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => setPrintHtml(null)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: '#334155',
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>⬅ Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => window.print()}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: '#db2777',
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  Compartilhar / Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {React.createElement('iframe', {
            id: 'print-iframe',
            srcDoc: printHtml,
            style: { flex: 1, border: 'none', width: '100%', height: 'calc(100% - 70px)' },
          })}
        </View>
      )}

      {/* DOM Injection para a Impressora da Apple capturar corretamente */}
      {printHtml &&
        typeof document !== 'undefined' &&
        createPortal(
          <div id="print-root" dangerouslySetInnerHTML={{ __html: printHtml }} />,
          document.body
        )}
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <View style={styles.infoCardBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  const isBad = value === 'Não Ok' || value === 'Incorreto' || value === 'Reprovado';
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isBad && styles.infoValueBad]}>{isBad ? '✕' : value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  notFound: { color: '#64748b', fontSize: 16 },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  resultLabel: { fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  resultSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  foto: { width: '100%', height: 200, borderRadius: 14, backgroundColor: '#f1f5f9' },
  fotoLegenda: { color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  fotoExtraRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fotoExtraThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f1f5f9' },
  fotoExtraDesc: { flex: 1, color: '#334155', fontSize: 12, lineHeight: 17 },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardTitle: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '700',
    padding: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  infoCardBody: { padding: 12, gap: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  infoLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', flex: 1.2 },
  infoValue: { color: '#1e293b', fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
  infoValueBad: { color: '#dc2626', fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  obsText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
  },
  parecerText: { fontSize: 14, fontWeight: '700', textAlign: 'center', paddingVertical: 10 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewPdfBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sharePdfBtn: {
    backgroundColor: '#db2777',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  printBtn: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pdfSavedText: { color: '#22c55e', fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
