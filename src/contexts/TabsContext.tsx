import { createContext, useContext, useState, useRef, useEffect } from 'react';

export type Tab = {
  id: string;
  title: string;
  url: string;
  webview?: Electron.WebviewTag;
};

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (url?: string, title?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabUrl: (id: string, url: string, title?: string) => void;
  registerWebview: (id: string, webview: Electron.WebviewTag) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: '' }]);
  const [activeTabId, setActiveTabId] = useState<string | null>('1');
  const webviewsRef = useRef<Map<string, Electron.WebviewTag>>(new Map());

  const registerWebview = (id: string, webview: Electron.WebviewTag) => {
    webviewsRef.current.set(id, webview);
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, webview } : tab
    ));
  };

  const addTab = (url = '', title = 'New Tab') => {
    const id = Date.now().toString();
    const newTab: Tab = { id, title, url };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    const webview = webviewsRef.current.get(id);
    if (webview) {
      webview.remove();
      webviewsRef.current.delete(id);
    }
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      setActiveTabId(newTabs[0]?.id || null);
    }
  };

  const setActiveTab = (id: string) => {
    // Скрываем все webview
    webviewsRef.current.forEach(wv => {
      wv.style.display = 'none';
    });
    
    // Показываем активный
    const activeWebview = webviewsRef.current.get(id);
    if (activeWebview) {
      activeWebview.style.display = 'block';
    }
    
    setActiveTabId(id);
  };

  const updateTabUrl = (id: string, url: string, title?: string) => {
    const webview = webviewsRef.current.get(id);
    if (webview) {
      webview.src = url;
    }
    
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, url, title: title || tab.title } : tab
    ));
  };

  return (
    <TabsContext.Provider value={{
      tabs,
      activeTabId,
      addTab,
      closeTab,
      setActiveTab,
      updateTabUrl,
      registerWebview
    }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within TabsProvider');
  return ctx;
};