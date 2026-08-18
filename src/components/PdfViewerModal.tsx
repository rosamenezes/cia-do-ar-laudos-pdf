import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LaudoParapente } from '../types/laudo';
import { generateLaudoHtml } from '../templates/laudoTemplate';

interface PdfViewerModalProps {
  visible: boolean;
  laudo: LaudoParapente | null;
  onClose: () => void;
  onShare?: () => void;
}

export function PdfViewerModal({ visible, laudo, onClose, onShare }: PdfViewerModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (visible && laudo) {
      generateLaudoHtml(laudo)
        .then((html) => {
          if (isMounted) {
            setHtmlContent(html);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Erro ao gerar HTML para visualização:', err);
          if (isMounted) {
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [visible, laudo]);

  if (!laudo) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#1e293b" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Visualização do Laudo</Text>
            <Text style={styles.headerSubtitle}>{laudo.numeroLaudo}</Text>
          </View>

          {onShare ? (
            <TouchableOpacity onPress={onShare} style={styles.shareBtn} activeOpacity={0.8}>
              <Ionicons name="share-social-outline" size={16} color="#ffffff" />
              <Text style={styles.shareBtnText}>Enviar</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* PDF / HTML Render Area */}
        <View style={styles.webviewContainer}>
          {loading || !htmlContent ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#db2777" />
              <Text style={styles.loadingText}>Carregando visualização...</Text>
            </View>
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={styles.webview}
              scalesPageToFit={true}
              showsVerticalScrollIndicator={true}
              androidHardwareAccelerationDisabled={false}
              overScrollMode="never"
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#db2777',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
