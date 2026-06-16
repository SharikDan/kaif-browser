import { useState, useRef, useEffect } from 'react';
import { useTabs } from '../contexts/TabsContext';
import { useBookmarks } from '../contexts/BookmarksContext';
import SearchEngineSelector, { SearchEngine, SEARCH_ENGINES } from './SearchEngineSelector';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();
  const { bookmarks, removeBookmark } = useBookmarks();

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
        justifyContent: 'flex-start',
        padding: '60px 20px 20px',
        overflowY: 'auto'
      }}
    >
      {/* Часы */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
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

      {/* Закладки */}
      {bookmarks.length > 0 && (
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '18px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⭐ Your Bookmarks
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {bookmarks.map(bm => (
              <div
                key={bm.id}
                style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => addTab(bm.url, bm.title)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ff0040';
                  e.currentTarget.style.background = 'rgba(255,0,64,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(bm.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
                {bm.favicon && (
                  <img 
                    src={bm.favicon} 
                    alt="" 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      marginBottom: '8px',
                      borderRadius: '4px'
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div style={{ 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {bm.title}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '4px'
                }}>
                  {bm.url.replace(/^https?:\/\//, '').split('/')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '20px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px'
      }}>
        KaifBrowser v4.6.0
      </div>
    </div>
  );
};

export default HomePage;