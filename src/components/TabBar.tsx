import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { X, Plus } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-sm border-b border-cyan-500/30 flex items-center gap-1 px-3 py-1 overflow-x-auto shadow-lg">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={`group relative flex items-center gap-2 px-5 py-2 rounded-t-lg cursor-pointer transition-all ${
            activeTabId === tab.id
              ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 text-cyan-300 border-b-2 border-cyan-500'
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <span className="text-sm max-w-[180px] truncate font-medium">
            {tab.title.length > 25 ? tab.title.slice(0, 22) + 'â€¦' : tab.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-white/10"
          >
            <X size={14} className="text-cyan-400" />
          </button>
        </motion.div>
      ))}
      <button
        onClick={() => addTab()}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <Plus size={18} className="text-cyan-400" />
      </button>
    </div>
  );
};