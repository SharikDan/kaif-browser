import { useEffect, useState } from 'react';
// @ts-ignore
import ColorThief from 'colorthief';

export const useWallpaperColors = (imageSrc: string) => {
  const [primary, setPrimary] = useState('#ffffff');
  const [onPrimary, setOnPrimary] = useState('#000000');

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(img);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      setPrimary(rgb);

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setOnPrimary(brightness > 128 ? '#1a1a1a' : '#f5f5f5');
    };
  }, [imageSrc]);

  return { primary, onPrimary };
};
