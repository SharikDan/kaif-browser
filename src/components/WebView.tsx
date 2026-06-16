import { useEffect, useRef, useState } from 'react';
import { shell } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

interface WebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
}

export const WebView = ({ url, onTitleChange }: WebViewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Отслеживаем изменение размера окна
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    
    // Устанавливаем окно в maximized режим при загрузке
    appWindow.maximize().catch(() => {});

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        // Cross-origin error
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
        position: 'absolute',
        top: '40px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100% - 40px)',
        overflow: 'hidden'
      }}
    >
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>️</div>
            <div style={{ fontSize: '28px', color: 'white', marginBottom: '16px', fontWeight: 'bold' }}>
              Site blocked iframe
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '16px' }}>
              This site doesn't allow embedding in iframes.
            </div>
            <button
              onClick={openInBrowser}
              style={{
                padding: '16px 32px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #ff0040 0%, #ff0066 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(255,0,64,0.5)'
              }}
            >
              Open in System Browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};