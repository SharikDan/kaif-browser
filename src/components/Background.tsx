import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Background: React.FC = () => {
  const { wallpaperSrc } = useTheme();
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${wallpaperSrc})` }}
    />
  );
};
