import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar por nome, modelo, série...' }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1e2d45', '#db2777'],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? '#db2777' : '#475569'}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#334155"
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color="#475569" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1526',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    marginLeft: 8,
  },
});
