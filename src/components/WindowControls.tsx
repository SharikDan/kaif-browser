import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  const handleMinimize = () => {
    appWindow.minimize().catch(e => console.error('minimize error:', e));
  };

  const handleMaximize = async () => {
    try {
      const isMax = await appWindow.isMaximized();
      if (isMax) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    } catch (e) {
      console.error('maximize error:', e);
    }
  };

  const handleClose = () => {
    appWindow.close().catch(e => console.error('close error:', e));
  };

  return (
    <div className="flex items-center gap-1 ml-2">
      <button
        onClick={handleMinimize}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={handleMaximize}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
      >
        <Square size={12} />
      </button>
      <button
        onClick={handleClose}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/80 transition text-white/80"
      >
        <X size={14} />
      </button>
    </div>
  );
};
export default WindowControls;