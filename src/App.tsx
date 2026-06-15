import { ThemeProvider } from './contexts/ThemeContext';
import { TabsProvider } from './contexts/TabsContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';

function App() {
  return (
    <ThemeProvider>
      <TabsProvider>
        <div data-tauri-drag-region className="w-full h-full relative overflow-hidden">
          <Background />
          <TabBar />
          <HomePage />
        </div>
      </TabsProvider>
    </ThemeProvider>
  );
}

export default App;