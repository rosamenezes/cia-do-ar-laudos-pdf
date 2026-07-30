import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LaudoForm } from '../../src/components/LaudoForm';
import { LaudoFormData, LaudoParapente } from '../../src/types/laudo';
import { saveLaudo, generateId, generateNumeroLaudo } from '../../src/services/database';

export default function NovoLaudoScreen() {
  const [isLoading, setIsLoading] = useState(false);

  // useMemo garante que o número do laudo não muda se o componente re-renderizar
  const defaultValues = useMemo(() => ({
    numeroLaudo: generateNumeroLaudo(),
    dataEmissao: new Date().toISOString().split('T')[0],
  }), []);

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

      Alert.alert(
        '✅ Laudo Salvo',
        `O laudo ${laudo.numeroLaudo} foi salvo com sucesso!`,
        [
          {
            text: 'Ver Laudo',
            onPress: () => router.replace(`/laudo/${laudo.id}`),
          },
          {
            text: 'Novo Laudo',
            onPress: () => router.replace('/(tabs)/novo'),
          },
        ]
      );
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LaudoForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
