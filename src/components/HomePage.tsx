import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import SearchEngineSelector, { SearchEngine, SEARCH_ENGINES } from './SearchEngineSelector';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  useEffect(() => {
    // Загружаем выбранный поисковик из localStorage
    const saved = localStorage.getItem('defaultSearchEngine') as SearchEngine | null;
    if (saved && SEARCH_ENGINES[saved]) {
      setSelectedEngine(saved);
    } else {
      setShowSelector(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEngineSelect = (engine: SearchEngine) => {
    localStorage.setItem('defaultSearchEngine', engine);
    setSelectedEngine(engine);
    setShowSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedEngine) return;
    
    let finalUrl: string;
    if ((query.includes('.') && !query.includes(' ')) || query.startsWith('http')) {
      finalUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      finalUrl = SEARCH_ENGINES[selectedEngine].url + encodeURIComponent(query);
    }
    addTab(finalUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  if (showSelector) {
    return <SearchEngineSelector onSelect={handleEngineSelect} />;
  }

  const currentEngine = SEARCH_ENGINES[selectedEngine!];

  return (
    <div data-tauri-drag-region className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
      <div data-tauri-drag-region className="text-center mb-8">
        <div className="text-7xl font-light text-white drop-shadow-lg mb-2" style={{ textShadow: '0 0 10px rgba(255,0,64,0.5)' }}>
          {formatTime(currentTime)}
        </div>
        <div className="text-xl text-white/80">{formatDate(currentTime)}</div>
      </div>
      <motion.div
        animate={{ width: isFocused ? '70%' : '50%' }}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="relative rounded-2xl backdrop-blur-xl bg-black/60 border-2 border-[#ff0040] shadow-[0_0_15px_#ff0040]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Search with ${currentEngine.name} or enter URL...`}
              className="w-full bg-transparent px-6 py-4 text-xl text-white placeholder-white/70 outline-none"
              style={{ caretColor: '#ff0040' }}
            />
          </div>
          <div className="flex justify-center items-center gap-3 mt-4">
            <span className="text-white/50 text-sm">Using:</span>
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              className="px-4 py-1 rounded-full text-sm bg-[#ff0040] text-white shadow-[0_0_8px_#ff0040] hover:bg-[#ff0040]/80 transition-all"
            >
              {currentEngine.icon} {currentEngine.name}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default HomePage;