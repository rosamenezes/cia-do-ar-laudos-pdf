import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from '../src/contexts/ThemeContext';
import React, { useMemo } from 'react';

// Mantém a tela de carregamento visível enquanto as fontes baixam
SplashScreen.preventAutoHideAsync();

function SafeInsetsOverride({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const customInsets = useMemo(
    () => (Platform.OS === 'web' ? { ...insets, bottom: 0 } : insets),
    [insets]
  );

  return (
    <SafeAreaInsetsContext.Provider value={customInsets}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Image
          source={require('../assets/images/icon.png')}
          style={{ width: 80, height: 80 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" backgroundColor={colors.card} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: 'Laudos',
            headerTitleAlign: 'center',
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={{ width: 38, height: 38 }}
                  resizeMode="contain"
                />
                <Text
                  style={{ fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}
                >
                  Cia. do Ar
                </Text>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/perfil')}
                style={{ padding: 8, marginRight: 4 }}
                activeOpacity={0.7}
              >
                <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="novo" options={{ title: 'Novo Laudo' }} />
        <Stack.Screen name="laudo/[id]" options={{ title: 'Laudo', presentation: 'card' }} />
        <Stack.Screen name="laudo/[id]/editar" options={{ title: 'Editar Laudo', presentation: 'card' }} />
        <Stack.Screen name="perfil" options={{ title: 'Perfil', presentation: 'card' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  // Força o carregamento da fonte dos ícones (corrige o sumiço na Web)
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider
      initialMetrics={
        Platform.OS === 'web'
          ? {
              frame: { x: 0, y: 0, width: 0, height: 0 },
              insets: { top: 0, left: 0, right: 0, bottom: 0 },
            }
          : undefined
      }
    >
      <SafeInsetsOverride>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </SafeInsetsOverride>
    </SafeAreaProvider>
  );
}
