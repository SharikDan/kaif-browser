import { ThemeProvider } from './contexts/ThemeContext';
import { TabsProvider, useTabs } from './contexts/TabsContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { useEffect, useRef } from 'react';

const WebViewComponent = ({ tab }: { tab: any }) => {
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const { updateTabUrl, registerWebview } = useTabs();

  useEffect(() => {
    if (webviewRef.current && tab.id) {
      const wv = webviewRef.current as any;
      
      // Регистрируем webview в контексте
      registerWebview(tab.id, wv);

      // Слушаем изменение заголовка
      const handleTitleUpdate = (e: any) => {
        if (e.title) {
          updateTabUrl(tab.id, tab.url, e.title);
        }
      };

      wv.addEventListener('did-navigate', handleTitleUpdate);
      wv.addEventListener('page-title-updated', handleTitleUpdate);

      return () => {
        wv.removeEventListener('did-navigate', handleTitleUpdate);
        wv.removeEventListener('page-title-updated', handleTitleUpdate);
      };
    }
  }, [tab.id, tab.url, registerWebview, updateTabUrl]);

  if (!tab.url) return null;

  return (
    <webview
      ref={webviewRef}
      src={tab.url}
      style={{
        position: 'fixed',
        top: '76px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100% - 76px)',
        border: 'none',
        display: 'none', // Скрыт по умолчанию, показывается через setActiveTab
        background: 'white'
      }}
      allowpopups="true"
      webpreferences="nodeIntegration=no,contextIsolation=yes"
    />
  );
};

const AppContent = () => {
  const { tabs, activeTabId, setActiveTab } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Когда меняется активная вкладка — показываем её
  useEffect(() => {
    if (activeTabId) {
      setActiveTab(activeTabId);
    }
  }, [activeTabId, setActiveTab]);

  return (
    <div 
      style={{ 
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f0f0f'
      }}
    >
      {!activeTab?.url && <Background />}
      <TabBar />
      
      {/* Рендерим все webview, но показываем только активный */}
      {tabs.map(tab => (
        tab.url && <WebViewComponent key={tab.id} tab={tab} />
      ))}
      
      {!activeTab?.url && <HomePage />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <TabsProvider>
        <AppContent />
      </TabsProvider>
    </ThemeProvider>
  );
}

export default App;