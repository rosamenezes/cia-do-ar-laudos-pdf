import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  inputBg: string;
  danger: string;
  success: string;
  divider: string;
  watermark: number;
};

export const lightTheme: ThemeColors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  primary: '#db2777',
  inputBg: '#ffffff',
  danger: '#ef4444',
  success: '#22c55e',
  divider: '#f1f5f9',
  watermark: 0.05,
};

type ThemeContextType = {
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
