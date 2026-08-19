import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, Text } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mantém a tela de carregamento visível enquanto as fontes baixam
SplashScreen.preventAutoHideAsync();

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
      </Stack>
    </View>
  );
}
