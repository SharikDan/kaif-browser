import React from 'react';
import { motion } from 'framer-motion';

export type SearchEngine = 'google' | 'duck' | 'yandex' | 'bing' | 'brave';

export const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', color: '#4285F4', icon: '🔍' },
  duck: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', color: '#DE5833', icon: '🦆' },
  yandex: { name: 'Yandex', url: 'https://yandex.ru/search/?text=', color: '#FC3F1D', icon: '🔎' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', color: '#00809D', icon: '️' },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', color: '#FB542B', icon: '🦁' }
};

interface SearchEngineSelectorProps {
  onSelect: (engine: SearchEngine) => void;
}

const SearchEngineSelector: React.FC<SearchEngineSelectorProps> = ({ onSelect }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-4" style={{ textShadow: '0 0 20px rgba(255,0,64,0.5)' }}>
          KaifBrowser
        </h1>
        <p className="text-xl text-white/70">Choose your default search engine</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
        {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((key, index) => {
          const engine = SEARCH_ENGINES[key];
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(key)}
              className="group relative p-6 rounded-2xl border-2 border-white/10 hover:border-[#ff0040] bg-white/5 hover:bg-[#ff0040]/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)]"
            >
              <div className="text-4xl mb-3">{engine.icon}</div>
              <div className="text-xl font-semibold text-white group-hover:text-[#ff0040] transition-colors">
                {engine.name}
              </div>
              <div className="text-sm text-white/50 mt-2 truncate">
                {engine.url.replace('https://', '').split('/')[0]}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-white/40 text-sm mt-8">You can change this later in settings</p>
    </div>
  );
};

export default SearchEngineSelector;