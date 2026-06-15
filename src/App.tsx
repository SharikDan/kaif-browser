import { TabsProvider, useTabs } from './contexts/TabsContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { WebView } from './components/WebView';

const AppContent: React.FC = () => {
  const { tabs, activeTabId, updateTabUrl } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#1a1a1a' }}>
      <Background />
      <TabBar />
      {activeTab?.url ? (
        <WebView url={activeTab.url} onTitleChange={(title: string) => {
          if (activeTabId) updateTabUrl(activeTabId, activeTab.url, title);
        }} />
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