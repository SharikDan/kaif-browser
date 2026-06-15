import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { appWindow } from '@tauri-apps/api/window';
import { X, Plus, Minus, Square } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-black/70 border-b border-[#ff0040] shadow-[0_1px_0_#ff0040] flex items-center gap-1 px-2 py-1 h-10 select-none"
    >
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {tabs.map(tab => (
          <motion.div
            key={tab.id}
            layout
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-t-lg cursor-pointer transition-all ${
              activeTabId === tab.id
                ? 'bg-[#ff0040]/20 text-white shadow-[inset_0_-2px_0_#ff0040]'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <span className="text-sm max-w-[150px] truncate">
              {tab.title.length > 20 ? tab.title.slice(0, 18) + '...' : tab.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-[#ff0040]/30"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
        <button onClick={() => addTab()} className="p-2 rounded-full hover:bg-[#ff0040]/30 transition">
          <Plus size={16} />
        </button>
      </div>
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
    </div>
  );
};