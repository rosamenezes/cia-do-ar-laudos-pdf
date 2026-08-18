import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../types/laudo';
import { PARECER_GERAL_SHORT_LABELS, PARECER_GERAL_COLORS } from '../types/constants';

interface LaudoCardProps {
  laudo: LaudoParapente;
  onPress: () => void;
  onDelete?: (id: string) => void;
}

function LaudoCardComponent({ laudo, onPress, onDelete }: LaudoCardProps) {
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Faixa lateral de status */}
      <View style={[styles.colorBar, { backgroundColor: resultColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.numeroLaudo}>{laudo.numeroLaudo}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={[
                styles.badge,
                { backgroundColor: resultColor + '18', borderColor: resultColor + '40' },
              ]}
            >
              <Text style={[styles.badgeText, { color: resultColor }]}>{resultLabel}</Text>
            </View>
            {onDelete && (
              <TouchableOpacity 
                onPress={() => onDelete(laudo.id!)} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.equipamento} numberOfLines={1}>
          {laudo.fabricaModelo}
        </Text>

        <View style={styles.proprietarioRow}>
          <Ionicons name="person" size={13} color="#64748b" />
          <Text style={styles.proprietario} numberOfLines={1}>
            {laudo.nomeProprietario}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
            <Text style={styles.metaText}>{formatDate(laudo.dataEmissao)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="barcode-outline" size={12} color="#94a3b8" />
            <Text style={styles.metaText}>S/N: {laudo.numeroSerie}</Text>
          </View>
        </View>

        {laudo.pdfUri && (
          <View style={styles.pdfTag}>
            <Ionicons name="document-text" size={12} color="#db2777" />
            <Text style={styles.pdfTagText}>PDF Gerado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const LaudoCard = memo(LaudoCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  colorBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 15,
    gap: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  numeroLaudo: {
    color: '#db2777',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  equipamento: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  proprietarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  proprietario: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  pdfTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fce7f3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pdfTagText: {
    color: '#db2777',
    fontSize: 11,
    fontWeight: '700',
  },
});
