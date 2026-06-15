import { TabsProvider, useTabs } from './contexts/TabsContext';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { WebView } from './components/WebView';

const AppContent = () => {
  const { tabs, activeTabId, updateTabUrl } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 50%, #0f0f0f 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}
    >
      <TabBar />
      {activeTab?.url ? (
        <WebView 
          url={activeTab.url} 
          onTitleChange={(title: string) => {
            if (activeTabId) updateTabUrl(activeTabId, activeTab.url, title);
          }} 
        />
      ) : (
        <HomePage />
      )}
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