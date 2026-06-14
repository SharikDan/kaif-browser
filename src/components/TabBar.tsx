import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Plus } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();
  const { primary } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-gray-100 border-b border-gray-300 flex items-center gap-1 px-2 py-1 overflow-x-auto shadow-sm">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${
            activeTabId === tab.id ? 'bg-white text-gray-900' : 'hover:bg-gray-200 text-gray-600'
          }`}
          style={activeTabId === tab.id ? { borderBottom: `2px solid ${primary}` } : {}}
        >
          <span className="text-sm max-w-[150px] truncate">
            {tab.title.length > 20 ? tab.title.slice(0, 18) + '…' : tab.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-gray-300"
          >
            <X size={12} className="text-gray-500" />
          </button>
        </motion.div>
      ))}
      <button
        onClick={() => addTab()}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <Plus size={16} className="text-gray-600" />
      </button>
    </div>
  );
};