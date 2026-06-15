import React from 'react';

export type SearchEngine = 'google' | 'duck' | 'yandex' | 'bing' | 'brave';

export const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G' },
  duck: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'D' },
  yandex: { name: 'Yandex', url: 'https://yandex.ru/search/?text=', icon: 'Y' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'B' },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: 'Bv' }
};

interface SearchEngineSelectorProps {
  onSelect: (engine: SearchEngine) => void;
}

const SearchEngineSelector: React.FC<SearchEngineSelectorProps> = ({ onSelect }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 50
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '16px',
        textShadow: '0 0 30px rgba(255,0,64,0.6)'
      }}>
        KaifBrowser
      </h1>
      <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>
        Choose your default search engine
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        maxWidth: '800px',
        width: '100%'
      }}>
        {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((key) => {
          const engine = SEARCH_ENGINES[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: 'white',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff0040';
                e.currentTarget.style.background = 'rgba(255,0,64,0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,64,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{engine.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{engine.name}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                {engine.url.replace('https://', '').split('/')[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchEngineSelector;