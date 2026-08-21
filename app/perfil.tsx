import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { logout } from '../src/services/authService';
import { useAppTheme } from '../src/contexts/ThemeContext';

export default function PerfilScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    if (window.confirm('Deseja sair da sua conta?')) {
      logout();
    }
  };

  
  // Dynamic styles
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    card: { backgroundColor: colors.card, shadowColor: '#000' },
    text: { color: colors.text },
    textSec: { color: colors.textSecondary },
    divider: { backgroundColor: colors.divider },
    logoutBtn: { backgroundColor: colors.card, borderColor: '#fecaca' }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 40 : Math.max(40, insets.bottom + 20) },
        ]}
      >
        <View style={[styles.profileCard, dynamicStyles.card]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#db2777" />
          </View>
          <Text style={[styles.userName, dynamicStyles.text]}>{user?.displayName || 'Usuário'}</Text>
          <Text style={[styles.userEmail, dynamicStyles.textSec]}>{user?.email || '—'}</Text>
        </View>

        <View style={[styles.infoCard, dynamicStyles.card]}>
          
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, dynamicStyles.textSec]}>Status</Text>
              <Text style={[styles.infoValue, dynamicStyles.text]}>Autenticado</Text>
            </View>
          </View>
          <View style={[styles.divider, dynamicStyles.divider]} />
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#3b82f6" />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, dynamicStyles.textSec]}>Organização</Text>
              <Text style={[styles.infoValue, dynamicStyles.text]}>Cia. do Ar</Text>
            </View>
          </View>
          <View style={[styles.divider, dynamicStyles.divider]} />
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, dynamicStyles.textSec]}>Versão do App</Text>
              <Text style={[styles.infoValue, dynamicStyles.text]}>1.0.0</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, dynamicStyles.logoutBtn]} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutBtnText, { color: colors.danger }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Cia. do Ar — Sistema de Laudos de Parapente</Text>
      </ScrollView>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },

  /* Card de Perfil */
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fce7f3',
    borderWidth: 3,
    borderColor: '#fbcfe8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  /* Card de Informações */
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 12,
    height: 50,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 32,
  },
});
