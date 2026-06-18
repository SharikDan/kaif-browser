import { ThemeProvider } from './contexts/ThemeContext';
import { TabsProvider, useTabs } from './contexts/TabsContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { BookmarksProvider } from './contexts/BookmarksContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';
import { WebView } from './components/WebView';

const AppContent = () => {
  const { tabs, activeTabId } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

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
      {activeTab?.url ? (
        <WebView 
          url={activeTab.url}
          tabId={activeTab.id}
          title={activeTab.title}
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