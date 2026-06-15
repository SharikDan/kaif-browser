import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabsContext';
import { ExternalLink, Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const quickLinks = [
    { name: 'Google', url: 'https://google.com', icon: '🔍' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '🤖' },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
      <div className="text-center mb-12">
        <div className="text-7xl font-light text-white drop-shadow-lg mb-2 tracking-wider" style={{ textShadow: '0 0 10px rgba(255,0,64,0.5)' }}>
          {formatTime(currentTime)}
        </div>
        <div className="text-xl text-white/80">
          {formatDate(currentTime)}
        </div>
      </div>

      <motion.div
        initial={{ width: '50%', opacity: 0.9 }}
        animate={{ width: isFocused ? '70%' : '50%', opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl"
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
              placeholder="Поиск в Интернете или введите адрес..."
              className="w-full bg-transparent px-6 py-4 text-xl text-white placeholder-white/70 outline-none"
              style={{ caretColor: '#ff0040' }}
            />
          </div>
        </form>
      </motion.div>

      <div className="flex gap-6 mt-12">
        {quickLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => addTab(link.url, link.name)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ff0040] transition-all duration-200 hover:shadow-[0_0_12px_#ff0040] group"
          >
            <span className="text-3xl">{link.icon}</span>
            <span className="text-sm text-white/80 group-hover:text-white">{link.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
