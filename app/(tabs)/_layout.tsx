import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          paddingTop: 6,
          minHeight: Platform.OS === 'android' ? 65 : 62,
          paddingBottom: Platform.OS === 'android' ? 10 : 0,
        },
        tabBarActiveTintColor: '#db2777',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 4,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        headerTintColor: '#0f172a',
        headerTitleStyle: { fontWeight: '800', fontSize: 22 },
        headerShadowVisible: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Laudos',
          tabBarLabel: 'Laudos',
          tabBarIcon: ({ color, size }) => <Ionicons name="documents" size={size} color={color} />,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
                source={require('../../assets/images/icon.png')}
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
