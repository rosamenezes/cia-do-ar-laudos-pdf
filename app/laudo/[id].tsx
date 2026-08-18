import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../../src/types/laudo';
import { getLaudoById, deleteLaudo } from '../../src/services/database';
import { generateAndShare, generateAndSavePdf } from '../../src/services/pdfGenerator';
import {
  PARECER_GERAL_LABELS,
  PARECER_GERAL_COLORS,
  PARECER_GERAL_SHORT_LABELS,
} from '../../src/types/constants';
import { PdfViewerModal } from '../../src/components/PdfViewerModal';

// Função pura fora do componente — não recriada a cada render
function formatDate(iso: string): string {
  if (!iso) return '-';
  const parts = iso.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso;
}

const GOOD_PARECERES = new Set(['OTIMO', 'MUITO_BOM', 'USADO_BOM_ESTADO']);

export default function LaudoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [laudo, setLaudo] = useState<LaudoParapente | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

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

  useEffect(() => {
    loadLaudo();
  }, [loadLaudo]);

  const _handleGeneratePdf = async () => {
    if (!laudo) return;
    try {
      setGeneratingPdf(true);
      const pdfUri = await generateAndSavePdf(laudo);
      setLaudo((prev) => (prev ? { ...prev, pdfUri } : prev));
      Alert.alert('✅ PDF Gerado', 'O PDF foi gerado e salvo no dispositivo.', [
        { text: 'Compartilhar', onPress: () => handleShare() },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível gerar o PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!laudo) return;
    try {
      setGeneratingPdf(true);
      await generateAndShare(laudo);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível compartilhar o laudo');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Laudo',
      `Deseja excluir o laudo ${laudo?.numeroLaudo}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!laudo) return;
            await deleteLaudo(laudo.id);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          },
        },
      ]
    );
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
  const parecerIcon = GOOD_PARECERES.has(laudo.parecerGeral)
    ? 'checkmark-circle'
    : laudo.parecerGeral === 'CONDENADO'
      ? 'close-circle'
      : 'alert-circle';

  return (
    <>
      <Stack.Screen
        options={{
          title: laudo.numeroLaudo,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
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
          { paddingBottom: Math.max(40, insets.bottom + 20) },
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

        {/* Foto */}
        {laudo.fotoUri && (
          <Image source={{ uri: laudo.fotoUri }} style={styles.foto} resizeMode="cover" />
        )}

        {/* Info Cards */}
        <InfoCard title="👤 Proprietário">
          <InfoRow label="Nome" value={laudo.nomeProprietario} />
          <InfoRow
            label="Cidade"
            value={
              laudo.cidade || (laudo.cidadeEstado ? laudo.cidadeEstado.split('-')[0].trim() : '-')
            }
          />
          <InfoRow
            label="Estado (UF)"
            value={
              laudo.estado ||
              (laudo.cidadeEstado && laudo.cidadeEstado.includes('-')
                ? laudo.cidadeEstado.split('-')[1].trim()
                : '-')
            }
          />
          <InfoRow label="Telefone" value={laudo.telefone} />
          <InfoRow label="Endereço" value={laudo.endereco} />
          <InfoRow label="E-mail" value={laudo.email} />
        </InfoCard>

        <InfoCard title="🪂 Vela">
          <InfoRow label="Fábrica/Modelo" value={laudo.fabricaModelo} />
          <InfoRow label="Nº Série" value={laudo.numeroSerie} />
          <InfoRow label="Fabricação" value={laudo.dataFabricacao} />
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
          <InfoRow label="Simetria e Trimagem" value={laudo.linhasSimetriaTrimagem} />
        </InfoCard>

        <InfoCard title="🛡️ Checagem do Tecido">
          <InfoRow label="Check do Perfil" value={laudo.tecidoCheckPerfil} />
          <InfoRow label="Check do Intradorso" value={laudo.tecidoCheckIntradorso} />
          <InfoRow label="Check do Bordo Ataque" value={laudo.tecidoCheckBordoAtaque} />
          <InfoRow label="Check do Extradorso" value={laudo.tecidoCheckExtradorso} />
          <View style={styles.divider} />
          <InfoRow label="Teste de Resistência" value={laudo.tecidoTesteResistencia} />
          <InfoRow label="Porosidade Bordo Ataque" value={laudo.tecidoPorosidadeBordoAtaque} />
          <InfoRow label="Porosidade Intradorso" value={laudo.tecidoPorosidadeIntradorso} />
          <InfoRow label="Porosidade Extradorso" value={laudo.tecidoPorosidadeExtradorso} />
          <View style={styles.divider} />
          <InfoRow label="Conforme Fabricante" value={laudo.parecerConformeFabricante} />
          {laudo.observacoes ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoLabel}>Observações:</Text>
              <Text style={styles.obsText}>{laudo.observacoes}</Text>
            </View>
          ) : null}
        </InfoCard>

        <InfoCard title="📋 Parecer Geral">
          <Text style={[styles.parecerText, { color: resultColor }]}>
            {PARECER_GERAL_LABELS[laudo.parecerGeral]}
          </Text>
        </InfoCard>

        {/* Ações PDF */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewPdfBtn]}
            onPress={() => setShowPdfModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={20} color="#0f172a" />
            <Text style={styles.viewPdfBtnText}>Visualizar PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={handleShare}
            disabled={generatingPdf}
            activeOpacity={0.8}
          >
            {generatingPdf ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>

        {laudo.pdfUri && (
          <Text style={styles.pdfSavedText}>✅ PDF gerado e pronto no aplicativo</Text>
        )}
      </ScrollView>

      {/* Modal de Visualização Nativa de PDF */}
      <PdfViewerModal
        visible={showPdfModal}
        laudo={laudo}
        onClose={() => setShowPdfModal(false)}
        onShare={handleShare}
      />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  const isBad = value === 'Não Ok' || value === 'Incorreto' || value === 'Reprovado';
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isBad && { color: '#ef4444', fontWeight: '700' }]}>
        {value}
      </Text>
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
  viewPdfBtnText: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  shareBtn: {
    backgroundColor: '#db2777',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pdfSavedText: { color: '#22c55e', fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
