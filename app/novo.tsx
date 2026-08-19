import React, { useState, useMemo } from 'react';
import { ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LaudoForm } from '../src/components/LaudoForm';
import { LaudoFormData, LaudoParapente } from '../src/types/laudo';
import { saveLaudo, generateId, generateNumeroLaudo } from '../src/services/database';

export default function NovoLaudoScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // useMemo garante que o número do laudo não muda se o componente re-renderizar
  const defaultValues = useMemo(
    () => ({
      numeroLaudo: generateNumeroLaudo(),
      dataEmissao: new Date().toISOString().split('T')[0],
    }),
    []
  );

  const handleSubmit = async (data: LaudoFormData) => {
    try {
      setIsLoading(true);

      const now = new Date().toISOString();
      const laudo: LaudoParapente = {
        ...data,
        id: generateId(),
        criadoEm: now,
        atualizadoEm: now,
      };

      await saveLaudo(laudo);

      window.alert(`✅ O laudo ${laudo.numeroLaudo} foi salvo com sucesso!`);
      router.replace(`/laudo/${laudo.id}`);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar o laudo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <LaudoForm defaultValues={defaultValues} onSubmit={handleSubmit} isLoading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
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
});
