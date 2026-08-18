import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../../src/types/laudo';
import { getLaudos, seedMockLaudos, deleteLaudo } from '../../src/services/database';
import { LaudoCard } from '../../src/components/LaudoCard';
import { SearchBar } from '../../src/components/SearchBar';

export default function LaudosScreen() {
  const insets = useSafeAreaInsets();
  const [laudos, setLaudos] = useState<LaudoParapente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const loadLaudos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLaudos();
      setLaudos(data);
    } catch (e) {
      console.error('Erro ao carregar laudos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      loadLaudos();
    }, [loadLaudos])
  );

  const handlePressLaudo = useCallback((laudo: LaudoParapente) => {
    router.push(`/laudo/${laudo.id}`);
  }, []);

  const handleDeleteLaudo = useCallback((id: string) => {
    Alert.alert(
      'Excluir Laudo',
      'Tem certeza que deseja excluir este laudo? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteLaudo(id);
              await loadLaudos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o laudo.');
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [loadLaudos]);

  // Filtragem em memória — instantânea
  const filteredLaudos = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (term.length === 0) return laudos;
    return laudos.filter(
      (l) =>
        l.nomeProprietario.toLowerCase().includes(term) ||
        l.numeroLaudo.toLowerCase().includes(term) ||
        l.fabricaModelo.toLowerCase().includes(term) ||
        l.numeroSerie.toLowerCase().includes(term)
    );
  }, [laudos, searchText]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#db2777" />
      </View>
    );
  }

  if (laudos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="documents-outline" size={56} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>Nenhum laudo ainda</Text>
        <Text style={styles.emptySubtitle}>
          Toque em "Novo" para criar seu primeiro laudo de inspeção
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={async () => {
            setLoading(true);
            await seedMockLaudos();
            await loadLaudos();
          }}
        >
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Gerar 5 Laudos de Exemplo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Busca */}
      <View style={styles.searchArea}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>

      {/* Lista ou estado vazio de busca */}
      {filteredLaudos.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#94a3b8" />
          <Text style={styles.noResultsTitle}>Nenhum resultado</Text>
          <Text style={styles.noResultsSubtitle}>
            Tente outro termo ou remova os filtros ativos
          </Text>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => setSearchText('')}>
            <Text style={styles.clearFiltersBtnText}>Limpar busca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLaudos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LaudoCard 
              laudo={item} 
              onPress={() => handlePressLaudo(item)} 
              onDelete={handleDeleteLaudo}
            />
          )}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadLaudos} tintColor="#db2777" />
          }
          contentContainerStyle={[styles.list, { paddingBottom: Math.max(80, insets.bottom + 80) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Botão Flutuante (FAB - Floating Action Button) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(20, insets.bottom + 10) }]}
        onPress={() => router.push('/(tabs)/novo')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  searchArea: {
    paddingTop: 12,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#db2777',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
    backgroundColor: '#f8fafc',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#db2777',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  noResultsSubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  clearFiltersBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#db2777',
  },
  clearFiltersBtnText: {
    color: '#db2777',
    fontSize: 13,
    fontWeight: '700',
  },
});
