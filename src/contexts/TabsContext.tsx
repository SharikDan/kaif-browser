import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow, PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window';

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
  const appWindow = getCurrentWindow();

  useEffect(() => {
    tabRef.current = tabs;
  }, [tabs]);

  const createWebview = async (id: string, url: string, title: string): Promise<WebviewWindow | undefined> => {
    try {
      const scaleFactor = await appWindow.scaleFactor();
      const outerSize = await appWindow.outerSize();
      
      const width = Math.round(outerSize.width / scaleFactor);
      const height = Math.round((outerSize.height / scaleFactor) - 76);
      
      const label = `webview-${id}-${Date.now()}`;
      
      // В Tauri 2.x parent работает! Дочернее окно = часть главного
      const webview = new WebviewWindow(label, {
        url: url,
        title: title,
        width: width,
        height: height,
        x: 0,
        y: 76,
        resizable: false,
        decorations: false,
        transparent: false,
        visible: true,
        focus: false,
        skipTaskbar: true,
        parent: "main",  // ДОЧЕРНЕЕ окно — работает в Tauri 2.x!
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

  // В Tauri 2.x дочерние окна автоматически следуют за родительским!
  // Но на всякий случай обновляем размер при resize
  useEffect(() => {
    const updateWebviews = async () => {
      const scaleFactor = await appWindow.scaleFactor();
      const outerSize = await appWindow.outerSize();
      
      const height = Math.round((outerSize.height / scaleFactor) - 76);
      
      for (const tab of tabRef.current) {
        if (tab.webview) {
          try {
            await tab.webview.setSize(new PhysicalSize(outerSize.width, Math.round(height * scaleFactor)));
          } catch (e) {}
        }
      }
    };

    const interval = setInterval(updateWebviews, 100);
    return () => clearInterval(interval);
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