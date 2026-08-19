import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LaudoParapente, LaudoFormData } from '../../../src/types/laudo';
import { getLaudoById, saveLaudo } from '../../../src/services/database';
import { LaudoForm } from '../../../src/components/LaudoForm';

export default function EditarLaudoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [laudo, setLaudo] = useState<LaudoParapente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLaudo = useCallback(async () => {
    try {
      const data = await getLaudoById(id);
      setLaudo(data);
    } catch (e) {
      console.error('Erro ao carregar laudo para edição:', e);
      Alert.alert('Erro', 'Não foi possível carregar o laudo.');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLaudo();
  }, [loadLaudo]);

  const handleSubmit = async (data: LaudoFormData) => {
    if (!laudo) return;
    try {
      setSaving(true);

      const laudoAtualizado: LaudoParapente = {
        ...data,
        id: laudo.id, // mantém o mesmo ID
        numeroLaudo: laudo.numeroLaudo, // número não muda
        criadoEm: laudo.criadoEm, // data de criação não muda
        atualizadoEm: new Date().toISOString(), // atualiza timestamp
        pdfUri: laudo.pdfUri, // preserva PDF anterior se houver
      };

      await saveLaudo(laudoAtualizado); // INSERT OR REPLACE atualiza o registro

      window.alert(`✅ As alterações no laudo ${laudo.numeroLaudo} foram salvas com sucesso.`);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
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
        <Text style={styles.errorText}>Laudo não encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Editar ${laudo.numeroLaudo}` }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(40, insets.bottom + 20) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LaudoForm
            defaultValues={laudo}
            onSubmit={handleSubmit}
            isLoading={saving}
            submitLabel="Salvar Alterações"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#64748b',
    fontSize: 16,
  },
});
