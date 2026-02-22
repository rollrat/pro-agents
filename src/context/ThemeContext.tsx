import { createContext, useContext } from 'react';
import type { Theme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
