import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { TabsProvider, useTabs } from './contexts/TabsContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { WebView } from './components/WebView';

const AppContent: React.FC = () => {
  const { tabs, activeTabId, updateTabUrl } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full relative overflow-hidden"
    >
      <Background />
      <TabBar />
      <div className="fixed inset-0 top-10" data-tauri-drag-region>
        {activeTab?.url ? (
          <WebView url={activeTab.url} onTitleChange={(title) => {
            if (activeTabId) updateTabUrl(activeTabId, activeTab.url, title);
          }} />
        ) : (
          <HomePage />
        )}
      </div>
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