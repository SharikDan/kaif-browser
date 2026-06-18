import { useEffect, useRef, useState } from 'react';
import { shell } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { useBookmarks } from '../contexts/BookmarksContext';
import { useTabs } from '../contexts/TabsContext';

interface WebViewProps {
  url: string;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export const WebView = ({ url, title, onTitleChange }: WebViewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addTab } = useTabs();

  useEffect(() => {
    appWindow.maximize().catch(() => {});
  }, []);

  useEffect(() => {
    if (!url || !iframeRef.current) return;
    
    setLoadTimeout(false);
    setCurrentTitle(title || url);
    const timeout = setTimeout(() => setLoadTimeout(true), 8000);

    const handler = () => {
      clearTimeout(timeout);
      const iframe = iframeRef.current;
      if (!iframe) return;
      
      try {
        if (iframe.contentDocument?.title) {
          const t = iframe.contentDocument.title;
          setCurrentTitle(t);
          onTitleChange?.(t);
        }
        
        // Пытаемся модифицировать ссылки (работает только для same-origin)
        const doc = iframe.contentDocument;
        if (doc) {
          const links = doc.querySelectorAll('a');
          links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            link.addEventListener('click', (e) => {
              const href = link.getAttribute('href');
              if (href && href.startsWith('http')) {
                e.preventDefault();
                addTab(href, link.textContent?.substring(0, 50) || 'New Tab');
              }
            });
          });
        }
      } catch (e) {
        console.log('Cross-origin iframe - cannot modify links');
      }
    };

    const iframe = iframeRef.current;
    iframe.addEventListener('load', handler);

    return () => {
      clearTimeout(timeout);
      iframe.removeEventListener('load', handler);
    };
  }, [url, onTitleChange, title, addTab]);

  const openInNewTab = () => {
    addTab(url, currentTitle || url);
  };

  const openInSystemBrowser = async () => {
    await shell.open(url);
  };

  if (!url) return null;

  const bookmarked = isBookmarked(url);

  return (
    <div 
      style={{
        position: 'absolute',
        top: '40px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100% - 40px)',
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      <div 
        style={{
          height: '36px',
          background: 'rgba(0,0,0,0.8)',
          borderBottom: '1px solid rgba(255,0,64,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px'
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
        <div style={{
          flex: 1,
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {url}
        </div>
        <button
          onClick={openInNewTab}
          title="Open in new tab"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px'
          }}
        >
          📑
        </button>
        <button
          onClick={openInSystemBrowser}
          title="Open in system browser"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px'
          }}
        >
          🌐
        </button>
      </div>
      
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          width: '100%',
          height: 'calc(100% - 36px)',
          border: 'none',
          display: 'block',
          background: 'white'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-modals allow-top-navigation-by-user-activation"
        title="webview"
      />
      {loadTimeout && (
        <div 
          style={{
            position: 'absolute',
            top: '36px',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 100
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              padding: '40px',
              borderRadius: '20px',
              background: 'rgba(0,0,0,0.9)',
              border: '3px solid #ff0040',
              boxShadow: '0 0 30px #ff0040',
              maxWidth: '500px'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '28px', color: 'white', marginBottom: '16px', fontWeight: 'bold' }}>
              Site blocked iframe
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '16px' }}>
              This site doesn't allow embedding in iframes.<br/>
              Use system browser for full functionality.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={openInSystemBrowser}
                style={{
                  padding: '14px 28px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ff0040 0%, #ff0066 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(255,0,64,0.5)'
                }}
              >
                🌐 Open in System Browser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};