import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Background } from './components/Background';
import { TabBar } from './components/TabBar';
import HomePage from './components/HomePage';

function App() {
  return (
    <ThemeProvider>
      <div data-tauri-drag-region className="w-full h-full relative overflow-hidden">
        <Background />
        <TabBar />
        <HomePage />
      </div>
    </ThemeProvider>
  );
}

export default App;