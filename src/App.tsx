import { TabsProvider, useTabs } from './contexts/TabsContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { WebView } from './components/WebView';
import { useMemo } from 'react';

const AppContent = () => {
  const { tabs, activeTabId, updateTabUrl } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const webView = useMemo(() => {
    if (!activeTab?.url) return null;
    return (
      <WebView 
        url={activeTab.url} 
        onTitleChange={(title: string) => {
          if (activeTabId) updateTabUrl(activeTabId, activeTab.url, title);
        }} 
      />
    );
  }, [activeTab?.url, activeTabId]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}
    >
      <Background />
      <TabBar />
      {activeTab?.url ? webView : <HomePage />}
    </div>
  );
};

function App() {
  return (
    <TabsProvider>
      <AppContent />
    </TabsProvider>
  );
}

export default App;