import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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
    <motion.div
      initial={{ width: '40%', opacity: 0.9 }}
      animate={{ width: isFocused ? '70%' : '40%', opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-2xl backdrop-blur-xl bg-black/60 border-2 border-[#ff0040] shadow-[0_0_15px_#ff0040] transition-all duration-300 hover:shadow-[0_0_25px_#ff0040]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Поиск или введите адрес..."
            className="w-full bg-transparent px-6 py-4 text-xl text-white placeholder-white/70 outline-none"
            style={{ caretColor: '#ff0040' }}
          />
        </div>
      </form>
    </motion.div>
  );
};

export default SearchBar;
