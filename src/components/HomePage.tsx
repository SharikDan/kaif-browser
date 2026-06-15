import React, { useState, useRef, useEffect } from 'react';
import { useTabs } from '../contexts/TabsContext';
import SearchEngineSelector, { SearchEngine, SEARCH_ENGINES } from './SearchEngineSelector';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  useEffect(() => {
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

  const currentEngine = selectedEngine ? SEARCH_ENGINES[selectedEngine] : null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '60px'
      }}
    >
      {/* Часы */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          fontSize: '80px', 
          fontWeight: 300, 
          color: 'white',
          textShadow: '0 0 20px rgba(255,0,64,0.7)',
          marginBottom: '10px'
        }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Поисковая строка */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid #ff0040',
          boxShadow: '0 0 20px #ff0040',
          backdropFilter: 'blur(10px)'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search with ${currentEngine?.name || 'engine'} or enter URL...`}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '20px 25px',
              fontSize: '20px',
              color: 'white',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Кнопка смены поисковика */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '12px', 
          marginTop: '20px' 
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Using:</span>
          <button
            type="button"
            onClick={() => setShowSelector(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: '#ff0040',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 0 10px #ff0040'
            }}
          >
            {currentEngine?.icon} {currentEngine?.name}
          </button>
        </div>
      </form>

      {/* Видимая подсказка для отладки */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px'
      }}>
        KaifBrowser v4.5.0 — Drag window from any edge
      </div>
    </div>
  );
};

export default HomePage;