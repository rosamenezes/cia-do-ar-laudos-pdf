import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../../src/types/laudo';
import { getLaudos } from '../../src/services/database';
import { LaudoCard } from '../../src/components/LaudoCard';
import { SearchBar } from '../../src/components/SearchBar';

export default function LaudosScreen() {
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

  // Filtragem em memória — instantânea
  const { filteredLaudos, isFiltering } = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (term.length === 0) return { filteredLaudos: laudos, isFiltering: false };
    return {
      filteredLaudos: laudos.filter(
        (l) =>
          l.nomeProprietario.toLowerCase().includes(term) ||
          l.numeroLaudo.toLowerCase().includes(term) ||
          l.fabricaModelo.toLowerCase().includes(term) ||
          l.numeroSerie.toLowerCase().includes(term)
      ),
      isFiltering: true,
    };
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
          <Ionicons name="documents-outline" size={56} color="#1e3a5f" />
        </View>
        <Text style={styles.emptyTitle}>Nenhum laudo ainda</Text>
        <Text style={styles.emptySubtitle}>
          Toque em "Novo" para criar seu primeiro laudo de inspeção
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)/novo')}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Criar Laudo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de estatísticas */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {isFiltering
            ? `${filteredLaudos.length} de ${laudos.length} ${laudos.length === 1 ? 'laudo' : 'laudos'}`
            : `${laudos.length} ${laudos.length === 1 ? 'laudo' : 'laudos'} registrados`}
        </Text>
        <TouchableOpacity onPress={loadLaudos}>
          <Ionicons name="refresh-outline" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchArea}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>

      {/* Lista ou estado vazio de busca */}
      {filteredLaudos.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#1e2d45" />
          <Text style={styles.noResultsTitle}>Nenhum resultado</Text>
          <Text style={styles.noResultsSubtitle}>
            Tente outro termo ou remova os filtros ativos
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearFiltersBtnText}>Limpar busca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLaudos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LaudoCard laudo={item} onPress={() => handlePressLaudo(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadLaudos}
              tintColor="#db2777"
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0e1a',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d45',
  },
  statsText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  searchArea: {
    paddingTop: 12,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
    backgroundColor: '#0a0e1a',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0d1526',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    color: '#f1f5f9',
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
    color: '#f1f5f9',
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
