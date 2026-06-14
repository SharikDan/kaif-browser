import React from 'react'; 
import { ThemeProvider } from './contexts/ThemeContext'; 
import { TabsProvider, useTabs } from './contexts/TabsContext'; 
import { Background } from './components/Background'; 
import { TabBar } from './components/TabBar'; 
import SearchBar from './components/SearchBar'; 
import { WebView } from './components/WebView'; 
 
const AppContent = () =
  const { tabs, activeTabId, updateTabUrl } = useTabs(); 
  const activeTab = tabs.find(tab = === activeTabId); 
 
  return <> 
    <Background /> 
    <TabBar /> 
    {activeTab?.url ?  
      <WebView url={activeTab.url} onTitleChange={(title) =
        if (activeTabId) updateTabUrl(activeTabId, activeTab.url, title); 
      }} />  
      :  
      <SearchBar />} 
  </>; 
}; 
 
function App() { 
  return  
    <ThemeProvider> 
      <TabsProvider> 
        <AppContent /> 
      </TabsProvider> 
    </ThemeProvider>; 
} 
 
export default App; 
