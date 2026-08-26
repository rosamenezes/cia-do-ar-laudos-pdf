import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../src/contexts/ThemeContext';
import { LaudoParapente } from '../src/types/laudo';
import { getLaudos, getTodosLaudos, seedMockLaudos, deleteLaudo } from '../src/services/database';
import { confirmar, notificar } from '../src/utils/feedback';
import { filtrarLaudos } from '../src/utils/busca';
import { LaudoCard } from '../src/components/LaudoCard';
import { SearchBar } from '../src/components/SearchBar';

export default function LaudosScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [laudos, setLaudos] = useState<LaudoParapente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // A listagem traz só a primeira página, para abrir rápido. A busca precisa do
  // histórico inteiro, então ele é carregado à parte — e só quando alguém busca,
  // para não pagar a leitura completa em toda abertura do app.
  const [historico, setHistorico] = useState<LaudoParapente[] | null>(null);
  const [statusHistorico, setStatusHistorico] = useState<
    'ocioso' | 'carregando' | 'pronto' | 'erro'
  >('ocioso');

  // Trava em ref, não em estado: o guard não pode ser uma dependência do efeito
  // que ele próprio altera, senão a busca se cancela e trava em "carregando".
  const historicoPedido = useRef(false);

  const invalidarHistorico = useCallback(() => {
    historicoPedido.current = false;
    setHistorico(null);
    setStatusHistorico('ocioso');
  }, []);

  const loadLaudos = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const data = await getLaudos();
        setLaudos(data);
        // Um laudo pode ter sido criado ou editado desde a última busca.
        invalidarHistorico();
      } catch (e) {
        console.error('Erro ao carregar laudos:', e);
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [invalidarHistorico]
  );

  // Recarrega ao voltar para a tela (silenciosamente se já tivermos dados)
  useFocusEffect(
    useCallback(() => {
      loadLaudos(laudos.length === 0);
    }, [loadLaudos, laudos.length])
  );

  const termoBusca = searchText.trim();
  const estaBuscando = termoBusca.length > 0;

  useEffect(() => {
    if (!estaBuscando || historicoPedido.current) return;

    historicoPedido.current = true;
    setStatusHistorico('carregando');

    getTodosLaudos()
      .then((todos) => {
        setHistorico(todos);
        setStatusHistorico('pronto');
      })
      .catch(() => {
        // Sem o histórico a busca ainda funciona, mas só sobre o que já está
        // na tela — o usuário precisa saber que o resultado é parcial.
        setStatusHistorico('erro');
      });
  }, [estaBuscando]);

  const handlePressLaudo = useCallback((laudo: LaudoParapente) => {
    router.push(`/laudo/${laudo.id}`);
  }, []);

  const handleDeleteLaudo = useCallback(
    (id: string) => {
      const confirmMessage = 'Tem certeza que deseja excluir este laudo? Esta ação não pode ser desfeita.';

      const processDeletion = async () => {
        // Exclusão Otimista: remove da tela instantaneamente (0 segundos de espera)
        setLaudos((prev) => prev.filter((l) => l.id !== id));
        setHistorico((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
        try {
          await deleteLaudo(id);
        } catch (error) {
          notificar('Não foi possível excluir o laudo. Ele será recarregado.');
          // Reverte puxando do banco novamente em caso de erro
          loadLaudos(false);
        }
      };

      confirmar('Excluir Laudo', confirmMessage, {
        rotuloConfirmar: 'Excluir',
        destrutivo: true,
      }).then((ok) => {
        if (ok) processDeletion();
      });
    },
    [loadLaudos]
  );

  // Enquanto o histórico não chega, filtra o que já está na tela: o resultado
  // aparece na hora e completa sozinho quando a leitura termina.
  const filteredLaudos = useMemo(() => {
    if (!estaBuscando) return laudos;
    return filtrarLaudos(historico ?? laudos, termoBusca);
  }, [laudos, historico, estaBuscando, termoBusca]);

  // Responsividade
  const { width } = useWindowDimensions();
  const numColumns = width > 1100 ? 3 : width > 700 ? 2 : 1;

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
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum laudo ainda</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Toque em "Novo" para criar seu primeiro laudo de inspeção
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={async () => {
            setLoading(true);
            await seedMockLaudos();
            await loadLaudos(false);
            setLoading(false);
          }}
        >
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Gerar 1 Laudo de Exemplo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Busca */}
      <View style={styles.searchArea}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>

      {/* Aviso enquanto o histórico completo ainda está a caminho */}
      {estaBuscando && statusHistorico === 'carregando' && (
        <View style={styles.buscaStatus}>
          <ActivityIndicator size="small" color="#db2777" />
          <Text style={styles.buscaStatusTexto}>Procurando no histórico completo…</Text>
        </View>
      )}
      {estaBuscando && statusHistorico === 'erro' && (
        <View style={styles.buscaStatus}>
          <Ionicons name="cloud-offline-outline" size={16} color="#b45309" />
          <Text style={[styles.buscaStatusTexto, styles.buscaStatusErro]}>
            Não foi possível carregar o histórico. Buscando só nos laudos já carregados.
          </Text>
        </View>
      )}

      {/* Lista ou estado vazio de busca */}
      {filteredLaudos.length === 0 && statusHistorico === 'carregando' ? (
        <View style={styles.noResultsContainer}>
          <ActivityIndicator size="large" color="#db2777" />
        </View>
      ) : filteredLaudos.length === 0 ? (
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
          key={`grid-${numColumns}`} // Força atualização ao virar a tela ou redimensionar a janela
          numColumns={numColumns}
          data={filteredLaudos}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={numColumns > 1 ? { gap: 16, paddingHorizontal: 16 } : undefined}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: numColumns > 1 ? `${100 / numColumns}%` : '100%' }}>
              <LaudoCard
                laudo={item}
                onPress={() => handlePressLaudo(item)}
                onDelete={handleDeleteLaudo}
              />
            </View>
          )}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadLaudos} tintColor="#db2777" />
          }
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === 'web' ? 100 : Math.max(80, insets.bottom + 80) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Botão Flutuante (FAB - Floating Action Button) */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: Platform.OS === 'web' ? 24 : Math.max(24, insets.bottom + 14) },
        ]}
        onPress={() => router.push('/novo')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buscaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  buscaStatusTexto: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  buscaStatusErro: {
    color: '#b45309',
  },
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
