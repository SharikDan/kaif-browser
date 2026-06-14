import React, { useState, useRef } from 'react';
import { useTabs } from '../contexts/TabsContext';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    let searchUrl: string;
    if (query.includes('.') && !query.includes(' ')) {
      searchUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
    addTab(searchUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-20">
      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск или введите адрес..."
              className="w-full bg-black/50 backdrop-blur-md border border-cyan-400 rounded-full px-6 py-4 text-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-[0_0_15px_rgba(0,255,204,0.3)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-5 py-2 rounded-full text-sm transition shadow-lg shadow-cyan-500/50"
            >
              Найти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;