import { useState } from 'react';
import { useBookmarks } from '../contexts/BookmarksContext';
import { useTabs } from '../contexts/TabsContext';

interface WebViewProps {
  url: string;
  tabId: string;
  title?: string;
}

export const WebView = ({ url, tabId, title }: WebViewProps) => {
  const [currentTitle, setCurrentTitle] = useState(title || url);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { updateTabUrl } = useTabs();
  const [editUrl, setEditUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(url);

  const bookmarked = isBookmarked(url);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      let finalUrl = urlInput;
      if (!urlInput.startsWith('http')) {
        if (urlInput.includes('.') && !urlInput.includes(' ')) {
          finalUrl = `https://${urlInput}`;
        }
      }
      updateTabUrl(tabId, finalUrl, finalUrl);
      setEditUrl(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '40px',
        left: 0,
        right: 0,
        height: '36px',
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(255,0,64,0.3)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
        zIndex: 20
      }}
    >
      <button
        onClick={() => toggleBookmark(url, currentTitle)}
        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        style={{
          background: 'transparent',
          border: 'none',
          color: bookmarked ? '#ff0040' : 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px'
        }}
      >
        {bookmarked ? '★' : '☆'}
      </button>
      
      {editUrl ? (
        <form onSubmit={handleUrlSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onBlur={() => setEditUrl(false)}
            autoFocus
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #ff0040',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'white',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </form>
      ) : (
        <div 
          onClick={() => { setUrlInput(url); setEditUrl(true); }}
          style={{
            flex: 1,
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'text',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px'
          }}
        >
          {url}
        </div>
      )}
    </div>
  );
};