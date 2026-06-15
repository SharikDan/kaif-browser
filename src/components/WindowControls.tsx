import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  const handleMinimize = () => { appWindow.minimize(); };
  const handleMaximize = async () => { await appWindow.toggleMaximize(); };
  const handleClose = () => { appWindow.close(); };

  return (
    <div className="flex items-center gap-1 ml-2">
      <button
        onClick={handleMinimize}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
        title="Minimize"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={handleMaximize}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition text-white/80"
        title="Maximize"
      >
        <Square size={12} />
      </button>
      <button
        onClick={handleClose}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/80 transition text-white/80"
        title="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
};
export default WindowControls;