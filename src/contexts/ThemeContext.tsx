import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallpaperColors } from '../hooks/useWallpaperColors';

interface ThemeContextType {
  primary: string;
  onPrimary: string;
  setWallpaper: (src: string) => void;
  wallpaperSrc: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallpaperSrc, setWallpaperSrc] = useState<string>('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920');
  const { primary, onPrimary } = useWallpaperColors(wallpaperSrc);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--on-primary', onPrimary);
  }, [primary, onPrimary]);

  return (
    <ThemeContext.Provider value={{ primary, onPrimary, setWallpaper: setWallpaperSrc, wallpaperSrc }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
