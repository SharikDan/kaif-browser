import { ThemeProvider } from './contexts/ThemeContext';
import { TabsProvider, useTabs } from './contexts/TabsContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { BookmarksProvider } from './contexts/BookmarksContext';
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
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!activeTab?.url && <Background />}
      <TabBar />
      {activeTab?.url ? (
        <WebView 
          url={activeTab.url} 
          title={activeTab.title}
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
    <ThemeProvider>
      <ProfileProvider>
        <BookmarksProvider>
          <TabsProvider>
            <AppContent />
          </TabsProvider>
        </BookmarksProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;