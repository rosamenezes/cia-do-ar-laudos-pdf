import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickFromCamera, pickFromGallery } from '../services/imageService';
import { confirmar, notificar } from '../utils/feedback';

interface PhotoCaptureProps {
  photoUri?: string;
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
  /** Título do estado vazio. Padrão: foto da vela */
  title?: string;
  subtitle?: string;
  /** Altura da miniatura quando já existe foto */
  height?: number;
}

export function PhotoCapture({
  photoUri,
  onPhotoSelected,
  onPhotoRemoved,
  title = 'Adicionar Foto da Vela',
  subtitle = 'Escolha como deseja adicionar',
  height = 200,
}: PhotoCaptureProps) {
  const handleCamera = async () => {
    try {
      const result = await pickFromCamera();
      if (result) onPhotoSelected(result.uri);
    } catch (e: any) {
      notificar('Erro', e.message ?? 'Não foi possível acessar a câmera');
    }
  };

  const handleGallery = async () => {
    try {
      const result = await pickFromGallery();
      if (result) onPhotoSelected(result.uri);
    } catch (e: any) {
      notificar('Erro', e.message ?? 'Não foi possível acessar a galeria');
    }
  };

  const handleRemove = async () => {
    const ok = await confirmar('Remover foto', 'Deseja remover a foto do laudo?', {
      rotuloConfirmar: 'Remover',
      destrutivo: true,
    });
    if (ok) onPhotoRemoved();
  };

  if (photoUri) {
    return (
      <View style={[styles.photoContainer, { height }]}>
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        {/* Overlay escuro no fundo */}
        <View style={styles.photoGradient}>
          <View style={styles.photoActions}>
            {/* Trocar via câmera */}
            <TouchableOpacity style={styles.photoBtn} onPress={handleCamera} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#fff" />
              <Text style={styles.photoBtnText}>Câmera</Text>
            </TouchableOpacity>
            {/* Trocar via galeria */}
            <TouchableOpacity
              style={[styles.photoBtn, styles.galleryBtn]}
              onPress={handleGallery}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={16} color="#fff" />
              <Text style={styles.photoBtnText}>Galeria</Text>
            </TouchableOpacity>
            {/* Remover */}
            <TouchableOpacity
              style={[styles.photoBtn, styles.removeBtn]}
              onPress={handleRemove}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Remover foto"
            >
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Badge de foto adicionada */}
        <View style={styles.photoBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
          <Text style={styles.photoBadgeText}>Foto adicionada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      {/* Ícone central */}
      <View style={styles.iconCircle}>
        <Ionicons name="camera" size={28} color="#db2777" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>

      {/* Dois botões lado a lado */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCamera} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={20} color="#db2777" />
          <Text style={styles.actionBtnText}>Câmera</Text>
          <Text style={styles.actionBtnSub}>Tirar foto agora</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionBtn} onPress={handleGallery} activeOpacity={0.8}>
          <Ionicons name="images-outline" size={20} color="#3b82f6" />
          <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>Galeria</Text>
          <Text style={styles.actionBtnSub}>Escolher da galeria</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Estado vazio ── */
  emptyContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 16,
    gap: 6,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fce7f3',
    borderWidth: 1.5,
    borderColor: '#fbcfe8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    gap: 0,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionBtnText: {
    color: '#db2777',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSub: {
    color: '#94a3b8',
    fontSize: 10,
  },
  actionDivider: {
    width: 10,
  },

  /* ── Estado com foto ── */
  photoContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(219,39,119,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  galleryBtn: {
    backgroundColor: 'rgba(59,130,246,0.85)',
  },
  removeBtn: {
    backgroundColor: 'rgba(239,68,68,0.85)',
    paddingHorizontal: 10,
    marginLeft: 'auto',
  },
  photoBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  photoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoBadgeText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
  },
});
