import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ParecerGeral } from '../types/laudo';
import { PARECER_GERAL_COLORS } from '../types/constants';

const FILTER_OPTIONS: { key: ParecerGeral; label: string }[] = [
  { key: 'OTIMO', label: 'Ótimo' },
  { key: 'MUITO_BOM', label: 'Muito Bom' },
  { key: 'USADO_BOM_ESTADO', label: 'Bom Estado' },
  { key: 'USADO_RAZOAVEL', label: 'Razoável' },
  { key: 'MUITO_USADO', label: 'Muito Usado' },
  { key: 'CONDENADO', label: 'Condenado' },
];

interface FilterChipsProps {
  activeFilter: ParecerGeral | null;
  onFilterChange: (filter: ParecerGeral | null) => void;
}

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  const handlePress = (key: ParecerGeral) => {
    // Toggle: se já está selecionado, desseleciona
    onFilterChange(activeFilter === key ? null : key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
    >
      {FILTER_OPTIONS.map(({ key, label }) => {
        const color = PARECER_GERAL_COLORS[key];
        const isActive = activeFilter === key;

        return (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              isActive && {
                backgroundColor: color + '22',
                borderColor: color,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.label, isActive && { color, fontWeight: '700' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d1526',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e2d45',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
});
