import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Plus } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();
  const { primary } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-black/60 border-b border-cyan-400/50 flex items-center gap-1 px-2 py-1 overflow-x-auto">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${
            activeTabId === tab.id ? 'bg-cyan-900/30' : 'hover:bg-white/5'
          }`}
          style={activeTabId === tab.id ? { borderBottom: `2px solid cyan`, boxShadow: '0 -2px 8px cyan' } : {}}
        >
          <span className="text-sm text-white/80 max-w-[150px] truncate">
            {tab.title.length > 20 ? tab.title.slice(0, 18) + '…' : tab.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-white/20"
          >
            <X size={12} className="text-white/70" />
          </button>
        </motion.div>
      ))}
      <button
        onClick={() => addTab()}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <Plus size={16} className="text-white/80" />
      </button>
    </div>
  );
};