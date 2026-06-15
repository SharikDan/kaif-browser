import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

const WindowControls: React.FC = () => {
  const [isMax, setIsMax] = useState(false);

  useEffect(() => {
    appWindow.isMaximized().then(setIsMax).catch(e => console.error('isMaximized error:', e));
  }, []);

  const handleMinimize = async () => {
    console.log('Minimize clicked');
    try {
      await appWindow.minimize();
      console.log('Minimized OK');
    } catch (e) {
      console.error('Minimize failed:', e);
    }
  };

  const handleMaximize = async () => {
    console.log('Maximize clicked');
    try {
      if (isMax) {
        await appWindow.unmaximize();
        setIsMax(false);
      } else {
        await appWindow.maximize();
        setIsMax(true);
      }
      console.log('Maximize OK, isMax:', !isMax);
    } catch (e) {
      console.error('Maximize failed:', e);
    }
  };

  const handleClose = async () => {
    console.log('Close clicked');
    try {
      await appWindow.close();
    } catch (e) {
      console.error('Close failed:', e);
    }
  };

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
        title={isMax ? "Restore" : "Maximize"}
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