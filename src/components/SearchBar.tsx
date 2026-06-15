import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';

const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duck: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  yandex: { name: 'Yandex', url: 'https://yandex.ru/search/?text=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' }
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [engine, setEngine] = useState<keyof typeof SEARCH_ENGINES>('google');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

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

  return (
    <motion.div animate={{ width: isFocused ? '70%' : '40%' }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-2xl">
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
        <div className="flex justify-center gap-3 mt-4">
          {(Object.keys(SEARCH_ENGINES) as Array<keyof typeof SEARCH_ENGINES>).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setEngine(key)}
              className={`px-3 py-1 rounded-full text-sm ${
                engine === key ? 'bg-[#ff0040] text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              {SEARCH_ENGINES[key].name}
            </button>
          ))}
        </div>
      </form>
    </motion.div>
  );
};
export default SearchBar;