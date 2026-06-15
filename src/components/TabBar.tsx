import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

export const TabBar: React.FC = () => {
  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-black/70 border-b border-[#ff0040] shadow-[0_1px_0_#ff0040] flex items-center justify-between px-4 py-2 h-10 select-none"
    >
      <div data-tauri-drag-region className="text-white/80 font-semibold">
        KaifBrowser
      </div>
      <div className="flex items-center gap-1">
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
    </div>
  );
};