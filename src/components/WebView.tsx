import { useRef, useEffect, useState } from 'react';
import { shell } from '@tauri-apps/api';

interface WebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
}

export const WebView = ({ url, onTitleChange }: WebViewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    if (!url || !iframeRef.current) return;
    
    setLoadTimeout(false);
    const timeout = setTimeout(() => setLoadTimeout(true), 8000);

    const handler = () => {
      clearTimeout(timeout);
      try {
        if (iframeRef.current?.contentDocument?.title) {
          onTitleChange?.(iframeRef.current.contentDocument.title);
        }
      } catch (e) {
        // Cross-origin error — это нормально
      }
    };

    const iframe = iframeRef.current;
    iframe.addEventListener('load', handler);

    return () => {
      clearTimeout(timeout);
      iframe.removeEventListener('load', handler);
    };
  }, [url, onTitleChange]);

  const openInBrowser = async () => {
    await shell.open(url);
  };

  if (!url) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '40px',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        background: 'white'
      }}
    >
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-top-navigation"
        title="webview"
      />
      {loadTimeout && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.8)',
              border: '2px solid #ff0040',
              boxShadow: '0 0 20px #ff0040',
              maxWidth: '400px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '24px', color: 'white', marginBottom: '12px' }}>
              Site blocked iframe
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              This site is loading too slowly or blocked iframe.
            </div>
            <button
              onClick={openInBrowser}
              style={{
                padding: '12px 24px',
                borderRadius: '20px',
                background: '#ff0040',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 0 15px #ff0040'
              }}
            >
              Open in system browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};