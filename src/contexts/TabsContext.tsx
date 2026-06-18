import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WebviewWindow, appWindow, PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';

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
  updateTabTitle: (id: string, title: string) => void;
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
      const outerPosition = await appWindow.outerPosition();
      
      const height = (outerSize.height / scaleFactor) - 76;
      const x = outerPosition.x / scaleFactor;
      const y = (outerPosition.y / scaleFactor) + 76;
      const width = outerSize.width / scaleFactor;
      
      const label = `webview-${id}-${Date.now()}`;
      
      // Создаём WebView через Rust (с перехватом навигации)
      try {
        await invoke('create_webview_with_navigation', {
          label,
          url,
          title,
          width,
          height,
          x,
          y
        });
      } catch (e) {
        console.error('Rust create failed, using JS fallback:', e);
        // Fallback: создаём через JS API
        const webview = new WebviewWindow(label, {
          url,
          title,
          width,
          height,
          x,
          y,
          resizable: false,
          decorations: false,
          transparent: false,
          visible: true,
          focus: false,
          alwaysOnTop: true,
          skipTaskbar: true,
        });
        return webview;
      }
      
      // Возвращаем reference к созданному окну
      return WebviewWindow.getByLabel(label) || undefined;
    } catch (e) {
      console.error('Failed to create webview:', e);
      return undefined;
    }
  };

  // Слушаем события навигации от Rust — открываем новые вкладки!
  useEffect(() => {
    const unlisten = listen<{ url: string; source_label: string }>('webview-navigation', (event) => {
      const { url } = event.payload;
      console.log('Navigation intercepted:', url);
      
      // Открываем ссылку в новой вкладке
      const title = url.substring(0, 50);
      addTab(url, title);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  // Слушаем resize главного окна — подстраиваем все webview
  useEffect(() => {
    const unlistenResize = listen('tauri://resize', async () => {
      const scaleFactor = await appWindow.scaleFactor();
      const outerSize = await appWindow.outerSize();
      const outerPosition = await appWindow.outerPosition();
      
      const height = (outerSize.height / scaleFactor) - 76;
      const x = outerPosition.x / scaleFactor;
      const y = (outerPosition.y / scaleFactor) + 76;
      
      for (const tab of tabRef.current) {
        if (tab.webview) {
          try {
            await tab.webview.setSize(new PhysicalSize(outerSize.width, Math.round(height * scaleFactor)));
            await tab.webview.setPosition(new PhysicalPosition(Math.round(x * scaleFactor), Math.round(y * scaleFactor)));
          } catch (e) {}
        }
      }
    });

    const unlistenMove = listen('tauri://move', async () => {
      const scaleFactor = await appWindow.scaleFactor();
      const outerPosition = await appWindow.outerPosition();
      
      const x = outerPosition.x / scaleFactor;
      const y = (outerPosition.y / scaleFactor) + 76;
      
      for (const tab of tabRef.current) {
        if (tab.webview) {
          try {
            await tab.webview.setPosition(new PhysicalPosition(Math.round(x * scaleFactor), Math.round(y * scaleFactor)));
          } catch (e) {}
        }
      }
    });

    return () => {
      unlistenResize.then(f => f());
      unlistenMove.then(f => f());
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

  const updateTabTitle = (id: string, title: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title } : t));
  };

  return (
    <TabsContext.Provider value={{
      tabs,
      activeTabId,
      addTab,
      closeTab,
      setActiveTab,
      updateTabUrl,
      updateTabTitle
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