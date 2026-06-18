import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WebviewWindow, appWindow, PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

export type Tab = {
  id: string;
  title: string;
  url: string;
  webview?: WebviewWindow;
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

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabRef = useRef<Tab[]>([]);

  useEffect(() => {
    tabRef.current = tabs;
  }, [tabs]);

  const createWebview = async (id: string, url: string, title: string): Promise<WebviewWindow | undefined> => {
    try {
      const scaleFactor = await appWindow.scaleFactor();
      const outerSize = await appWindow.outerSize();
      
      const width = outerSize.width / scaleFactor;
      const height = (outerSize.height / scaleFactor) - 76;
      
      const label = `webview-${id}-${Date.now()}`;
      
      // Создаём WebView как ДОЧЕРНЕЕ окно главного (parent: "main")
      const webview = new WebviewWindow(label, {
        url: url,
        title: title,
        width: width,
        height: height,
        x: 0,
        y: 76, // Под таб-баром
        resizable: false, // Не resizable отдельно
        decorations: false,
        transparent: false,
        visible: true,
        focus: false,
        alwaysOnTop: false,
        skipTaskbar: true, // Не видно в панели задач
        parent: "main", // ДОЧЕРНЕЕ окно главного!
      });

      webview.once('tauri://error', (e) => {
        console.error('Webview error:', e);
      });

      return webview;
    } catch (e) {
      console.error('Failed to create webview:', e);
      return undefined;
    }
  };

  // Обновляем размеры WebView при resize главного окна
  useEffect(() => {
    const updateWebviews = async () => {
      const scaleFactor = await appWindow.scaleFactor();
      const outerSize = await appWindow.outerSize();
      
      const height = (outerSize.height / scaleFactor) - 76;
      
      for (const tab of tabRef.current) {
        if (tab.webview) {
          try {
            // Обновляем только размер (позиция фиксирована относительно родителя)
            await tab.webview.setSize(new PhysicalSize(outerSize.width, Math.round(height * scaleFactor)));
          } catch (e) {}
        }
      }
    };

    const unlistenResize = listen('tauri://resize', updateWebviews);

    return () => {
      unlistenResize.then(f => f());
    };
  }, []);

  const addTab = async (url = '', title = 'New Tab') => {
    const id = Date.now().toString();
    const newTab: Tab = { id, title, url };
    
    if (url) {
      const webview = await createWebview(id, url, title);
      newTab.webview = webview;
      
      if (activeTabId) {
        const currentActive = tabRef.current.find(t => t.id === activeTabId);
        if (currentActive?.webview) {
          try { await currentActive.webview.hide(); } catch {}
        }
      }
    }
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = async (id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (tab?.webview) {
      try { await tab.webview.close(); } catch {}
    }
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      const newActive = newTabs[newTabs.length - 1];
      setActiveTabId(newActive?.id || null);
      if (newActive?.webview) {
        try { await newActive.webview.show(); await newActive.webview.setFocus(); } catch {}
      }
    }
  };

  const setActiveTab = async (id: string) => {
    const currentActive = tabs.find(t => t.id === activeTabId);
    if (currentActive?.webview) {
      try { await currentActive.webview.hide(); } catch {}
    }
    
    const newActive = tabs.find(t => t.id === id);
    if (newActive?.webview) {
      try { 
        await newActive.webview.show(); 
        await newActive.webview.setFocus();
      } catch {}
    }
    
    setActiveTabId(id);
  };

  const updateTabUrl = async (id: string, url: string, title?: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === id) {
        if (tab.webview) {
          try { tab.webview.close(); } catch {}
        }
        return { ...tab, url, title: title || tab.title, webview: undefined };
      }
      return tab;
    }));
    
    const tab = tabRef.current.find(t => t.id === id);
    if (tab) {
      const webview = await createWebview(id, url, title || tab.title);
      setTabs(prev => prev.map(t => t.id === id ? { ...t, webview } : t));
    }
  };

  return (
    <TabsContext.Provider value={{
      tabs,
      activeTabId,
      addTab,
      closeTab,
      setActiveTab,
      updateTabUrl
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