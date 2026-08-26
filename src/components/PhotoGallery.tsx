import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickFromCamera, pickFromGallery } from '../services/imageService';
import { FotoAdicional } from '../types/laudo';
import { notificar } from '../utils/feedback';

interface PhotoGalleryProps {
  value?: FotoAdicional[];
  onChange: (fotos: FotoAdicional[]) => void;
}

/**
 * Lista de fotos complementares do equipamento (rasgos, remendos, reparos).
 * Cada foto tem uma descrição livre que sai impressa como legenda no laudo.
 */
export function PhotoGallery({ value = [], onChange }: PhotoGalleryProps) {
  const adicionar = async (origem: 'camera' | 'galeria') => {
    try {
      const result = origem === 'camera' ? await pickFromCamera() : await pickFromGallery();
      if (result) onChange([...value, { uri: result.uri, descricao: '' }]);
    } catch (e: any) {
      notificar('Erro', e.message ?? 'Não foi possível adicionar a foto');
    }
  };

  const remover = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const atualizarDescricao = (index: number, descricao: string) => {
    onChange(value.map((foto, i) => (i === index ? { ...foto, descricao } : foto)));
  };

  return (
    <View style={styles.container}>
      {value.map((foto, index) => (
        <View key={`${index}-${foto.uri.slice(-16)}`} style={styles.item}>
          <Image source={{ uri: foto.uri }} style={styles.thumb} resizeMode="cover" />

          <View style={styles.itemBody}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Foto {index + 1}</Text>
              <TouchableOpacity
                onPress={() => remover(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={foto.descricao}
              onChangeText={(txt) => atualizarDescricao(index, txt)}
              placeholder="Ex: rasgo no painel 12 / costura refeita"
              placeholderTextColor="#94a3b8"
              multiline
            />
          </View>
        </View>
      ))}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => adicionar('camera')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={18} color="#db2777" />
          <Text style={styles.actionBtnText}>Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => adicionar('galeria')}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={18} color="#3b82f6" />
          <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>Galeria</Text>
        </TouchableOpacity>
      </View>

      {value.length === 0 && (
        <Text style={styles.hint}>
          Nenhuma foto complementar. Use este espaço para registrar rasgos, remendos ou partes
          refeitas do equipamento.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  itemBody: {
    flex: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    minHeight: 46,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
  },
  actionBtnText: {
    color: '#db2777',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
});
