import React, { createContext, useContext, useState } from 'react';

export type Tab = {
  id: string;
  title: string;
  url: string;
};

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (url?: string, title?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabUrl: (id: string, url: string, title?: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'Новая вкладка', url: '' }]);
  const [activeTabId, setActiveTabId] = useState<string | null>('1');

  const addTab = (url = '', title = 'Новая вкладка') => {
    const id = Date.now().toString();
    const newTab = { id, title, url };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0]?.id || null);
    }
  };

  const setActiveTab = (id: string) => setActiveTabId(id);
  const updateTabUrl = (id: string, url: string, title?: string) => {
    setTabs(prev => prev.map(tab => tab.id === id ? { ...tab, url, title: title || tab.title } : tab));
  };

  return (
    <TabsContext.Provider value={{ tabs, activeTabId, addTab, closeTab, setActiveTab, updateTabUrl }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within TabsProvider');
  return ctx;
};
