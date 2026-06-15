import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';

const SEARCH_ENGINES = {
  duck: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  startpage: { name: 'Startpage', url: 'https://www.startpage.com/do/dsearch?query=' },
  qwant: { name: 'Qwant', url: 'https://www.qwant.com/?q=' },
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  yandex: { name: 'Yandex', url: 'https://yandex.ru/search/?text=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' }
};

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [engine, setEngine] = useState<keyof typeof SEARCH_ENGINES>('duck');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    let finalUrl: string;
    if ((query.includes('.') && !query.includes(' ')) || query.startsWith('http')) {
      finalUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      finalUrl = SEARCH_ENGINES[engine].url + encodeURIComponent(query);
    }
    addTab(finalUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

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
              placeholder="Search or enter URL..."
              className="w-full bg-transparent px-6 py-4 text-xl text-white placeholder-white/70 outline-none"
              style={{ caretColor: '#ff0040' }}
            />
          </div>
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            {(Object.keys(SEARCH_ENGINES) as Array<keyof typeof SEARCH_ENGINES>).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setEngine(key)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  engine === key
                    ? 'bg-[#ff0040] text-white shadow-[0_0_8px_#ff0040]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {SEARCH_ENGINES[key].name}
              </button>
            ))}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default HomePage;