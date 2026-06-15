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
      const colorMap = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        const key = r + ',' + g + ',' + b;
        if (colorMap[key]) {
          colorMap[key]++;
        } else {
          colorMap[key] = 1;
        }
      }
      let maxCount = 0;
      let dominant = '0,0,0';
      for (const color in colorMap) {
        const count = colorMap[color];
        if (count > maxCount) {
          maxCount = count;
          dominant = color;
        }
      }
      const parts = dominant.split(',');
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      setPrimary(rgb);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setOnPrimary(brightness > 128 ? '#1a1a1a' : '#f5f5f5');
    };
  }, [imageSrc]);

  return { primary, onPrimary };
};
