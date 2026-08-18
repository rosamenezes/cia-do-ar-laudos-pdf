import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
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
