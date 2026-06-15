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
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      
      const rgb = gb(, , );
      setPrimary(rgb);
      
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setOnPrimary(brightness > 128 ? '#1a1a1a' : '#f5f5f5');
    };
  }, [imageSrc]);

  return { primary, onPrimary };
};
