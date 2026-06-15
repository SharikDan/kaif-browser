import React from 'react';

export const Background: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 50%, #1a1a1a 100%)'
      }}
    />
  );
};