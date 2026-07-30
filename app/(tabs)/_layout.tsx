import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0d1526',
          borderTopColor: '#1e2d45',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: '#db2777',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: { backgroundColor: '#0a0e1a' },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Laudos',
          tabBarLabel: 'Laudos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="documents" size={size} color={color} />
          ),
          headerTitle: '🪂 Cia. do Ar',
        }}
      />
      <Tabs.Screen
        name="novo"
        options={{
          title: 'Novo Laudo',
          tabBarLabel: 'Novo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 4} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
