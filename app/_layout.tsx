import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Mantém a tela de carregamento visível enquanto as fontes baixam
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Tenta acessar página protegida sem estar logado -> Login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Tenta acessar página de login já estando logado -> Home
      router.replace('/');
    }
  }, [loading, isAuthenticated, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f1f5f9',
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
        <ActivityIndicator size="large" color="#db2777" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e293b',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f8fafc' },
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
                  style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 }}
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
                <Ionicons name="person-circle-outline" size={28} color="#64748b" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="novo"
          options={{
            title: 'Novo Laudo',
          }}
        />
        <Stack.Screen
          name="laudo/[id]"
          options={{
            title: 'Laudo',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="laudo/[id]/editar"
          options={{
            title: 'Editar Laudo',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            presentation: 'card',
          }}
        />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
