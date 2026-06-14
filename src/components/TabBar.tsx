import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { X, Plus } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-b border-cyan-400/30 flex items-center gap-1 px-2 py-1 overflow-x-auto shadow-sm">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${
            activeTabId === tab.id ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400' : 'hover:bg-white/10 text-gray-300'
          }`}
        >
          <span className="text-sm max-w-[150px] truncate">
            {tab.title.length > 20 ? tab.title.slice(0, 18) + 'Ã¢â‚¬Â¦' : tab.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-white/20"
          >
            <X size={12} className="text-gray-400" />
          </button>
        </motion.div>
      ))}
      <button
        onClick={() => addTab()}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <Plus size={16} className="text-cyan-400" />
      </button>
    </div>
  );
};