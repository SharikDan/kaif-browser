import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <div className="flex items-center gap-2 ml-auto">
      <button onClick={handleMinimize} className="p-1 rounded-md hover:bg-white/10 text-white/80">
        <Minus size={14} />
      </button>
      <button onClick={handleMaximize} className="p-1 rounded-md hover:bg-white/10 text-white/80">
        <Square size={12} />
      </button>
      <button onClick={handleClose} className="p-1 rounded-md hover:bg-red-500/80 text-white/80">
        <X size={14} />
      </button>
    </div>
  );
};
export default WindowControls;