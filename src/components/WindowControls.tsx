import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={() => appWindow.minimize()}
        className="p-1 rounded-md hover:bg-white/10 transition-all"
        aria-label="Свернуть"
      >
        <Minus size={14} className="text-white/80" />
      </button>
      <button
        onClick={async () => {
          const isFullscreen = await appWindow.isFullscreen();
          if (isFullscreen) {
            await appWindow.setFullscreen(false);
          } else {
            await appWindow.setFullscreen(true);
          }
        }}
        className="p-1 rounded-md hover:bg-white/10 transition-all"
        aria-label="Развернуть"
      >
        <Square size={12} className="text-white/80" />
      </button>
      <button
        onClick={() => appWindow.close()}
        className="p-1 rounded-md hover:bg-red-500/80 transition-all"
        aria-label="Закрыть"
      >
        <X size={14} className="text-white/80" />
      </button>
    </div>
  );
};

export default WindowControls;
