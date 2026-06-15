export const Background = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 50%, #0f0f0f 100%)'
      }}
    />
  );
};