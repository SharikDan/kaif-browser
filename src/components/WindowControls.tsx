import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  const handleMinimize = () => appWindow.minimize();
  const handleToggleFullscreen = async () => {
    const isFullscreen = await appWindow.isFullscreen();
    if (isFullscreen) {
      await appWindow.setFullscreen(false);
    } else {
      await appWindow.setFullscreen(true);
    }
  };
  const handleClose = () => appWindow.close();

  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={handleMinimize}
        className="p-1 rounded-md hover:bg-white/10 transition-all"
        aria-label="Minimize"
      >
        <Minus size={14} className="text-white/80" />
      </button>
      <button
        onClick={handleToggleFullscreen}
        className="p-1 rounded-md hover:bg-white/10 transition-all"
        aria-label="Fullscreen"
      >
        <Square size={12} className="text-white/80" />
      </button>
      <button
        onClick={handleClose}
        className="p-1 rounded-md hover:bg-red-500/80 transition-all"
        aria-label="Close"
      >
        <X size={14} className="text-white/80" />
      </button>
    </div>
  );
};

export default WindowControls;