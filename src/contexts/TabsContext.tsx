import React, { createContext, useContext, useState } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';

export type Tab = {
  id: string;
  title: string;
  url: string;
  webview?: WebviewWindow;
};

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (url?: string, title?: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabUrl: (id: string, url: string, title?: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: '' }]);
  const [activeTabId, setActiveTabId] = useState<string | null>('1');

  const addTab = async (url = '', title = 'New Tab') => {
    const id = Date.now().toString();
    const newTab: Tab = { id, title, url };
    
    // Если есть URL, создаём WebviewWindow
    if (url) {
      try {
        const label = `webview-${id}`;
        const webview = new WebviewWindow(label, {
          url: url,
          title: title,
          width: 1200,
          height: 700,
          x: 0,
          y: 40,
          resizable: true,
          decorations: false,
          transparent: true,
          alwaysOnTop: false,
          visible: true,
          center: false
        });
        newTab.webview = webview;
      } catch (e) {
        console.error('Failed to create webview:', e);
      }
    }
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (tab?.webview) {
      tab.webview.close().catch(() => {});
    }
    
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0]?.id || null);
    }
  };

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
    // Показываем выбранную вкладку, скрываем остальные
    tabs.forEach(tab => {
      if (tab.webview) {
        if (tab.id === id) {
          tab.webview.show().catch(() => {});
          tab.webview.setFocus().catch(() => {});
        } else {
          tab.webview.hide().catch(() => {});
        }
      }
    });
  };

  const updateTabUrl = (id: string, url: string, title?: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === id) {
        // Если URL изменился, создаём новый webview
        if (tab.url !== url && tab.webview) {
          tab.webview.close().catch(() => {});
          const label = `webview-${id}-${Date.now()}`;
          const webview = new WebviewWindow(label, {
            url: url,
            title: title || tab.title,
            width: 1200,
            height: 700,
            x: 0,
            y: 40,
            resizable: true,
            decorations: false,
            transparent: true,
            alwaysOnTop: false,
            visible: true,
            center: false
          });
          return { ...tab, url, title: title || tab.title, webview };
        }
        return { ...tab, url, title: title || tab.title };
      }
      return tab;
    }));
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