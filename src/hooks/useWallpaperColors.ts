import { useEffect, useState } from 'react';

export const useWallpaperColors = (imageSrc: string) => {
  const [primary, setPrimary] = useState('#ffffff');
  const [onPrimary, setOnPrimary] = useState('#000000');

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      let maxCount = 0;
      let dominantKey = '0,0,0';
      for (const [key, count] of Object.entries(colorMap)) {
        if (count > maxCount) {
          maxCount = count;
          dominantKey = key;
        }
      }
      const [r, g, b] = dominantKey.split(',').map(Number);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      setPrimary(rgb);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setOnPrimary(brightness > 128 ? '#1a1a1a' : '#f5f5f5');
    };
  }, [imageSrc]);

  return { primary, onPrimary };
};
