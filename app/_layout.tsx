import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0e1a' }}>
      <StatusBar style="light" backgroundColor="#0a0e1a" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0e1a' },
          headerTintColor: '#f1f5f9',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0a0e1a' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
