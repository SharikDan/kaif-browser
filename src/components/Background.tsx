import React, { useState } from 'react';

export const Background = () => {
  const [imageError, setImageError] = useState(false);
  
  // Пробуем загрузить обои из public/wallpaper.jpg или public/wallpaper.png
  const wallpaperUrl = imageError 
    ? null 
    : '/wallpaper.jpg';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        background: wallpaperUrl && !imageError
          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${wallpaperUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 50%, #0f0f0f 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'all 0.7s ease'
      }}
    />
  );
};