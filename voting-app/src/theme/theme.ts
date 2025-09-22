import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#667eea',
    secondary: '#764ba2',
    tertiary: '#f093fb',
    surface: '#ffffff',
    background: '#f8f9fa',
    error: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
  },
  roundness: 16,
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
  },
};
