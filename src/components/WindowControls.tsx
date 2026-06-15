import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  return (
    <div className="flex items-center gap-1 ml-2">
      <button
        onClick={() => appWindow.minimize()}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={async () => {
          const isMax = await appWindow.isMaximized();
          if (isMax) {
            await appWindow.unmaximize();
          } else {
            await appWindow.maximize();
          }
        }}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
      >
        <Square size={12} />
      </button>
      <button
        onClick={() => appWindow.close()}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/80 transition text-white/80"
      >
        <X size={14} />
      </button>
    </div>
  );
};
export default WindowControls;