import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LaudoParapente } from '../types/laudo';
import { PARECER_GERAL_SHORT_LABELS, PARECER_GERAL_COLORS } from '../types/constants';

interface LaudoCardProps {
  laudo: LaudoParapente;
  onPress: () => void;
}

export function LaudoCard({ laudo, onPress }: LaudoCardProps) {
  const resultColor = PARECER_GERAL_COLORS[laudo.parecerGeral] || '#475569';
  const resultLabel = PARECER_GERAL_SHORT_LABELS[laudo.parecerGeral] || 'Desconhecido';

  const formatDate = (iso: string) => {
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return iso;
    } catch {
      return iso;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Indicador de resultado */}
      <View style={[styles.colorBar, { backgroundColor: resultColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.numeroLaudo}>{laudo.numeroLaudo}</Text>
          <View style={[styles.badge, { backgroundColor: resultColor + '22', borderColor: resultColor }]}>
            <Text style={[styles.badgeText, { color: resultColor }]}>{resultLabel}</Text>
          </View>
        </View>

        <Text style={styles.equipamento}>
          {laudo.fabricaModelo}
        </Text>

        <Text style={styles.proprietario}>
          👤 {laudo.nomeProprietario}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.meta}>📅 {formatDate(laudo.dataEmissao)}</Text>
          <Text style={styles.meta}>S/N: {laudo.numeroSerie}</Text>
        </View>

        {laudo.pdfUri && (
          <View style={styles.pdfTag}>
            <Text style={styles.pdfTagText}>📄 PDF gerado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131929',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2d45',
  },
  colorBar: {
    width: 5,
    borderRadius: 0,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  numeroLaudo: {
    color: '#db2777',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  equipamento: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  proprietario: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
  },
  pdfTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a5f',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pdfTagText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '600',
  },
});
