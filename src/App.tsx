import { TabsProvider, useTabs } from './contexts/TabsContext';
import { Background } from './components/Background';
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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Background />
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