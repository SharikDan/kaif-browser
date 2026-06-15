import React, { useEffect, useRef, useState } from 'react';
import { shell } from '@tauri-apps/api';

interface WebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
}

export const WebView: React.FC<WebViewProps> = ({ url, onTitleChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoadError(false);
    setLoadTimeout(false);

    const timeout = setTimeout(() => {
      setLoadTimeout(true);
    }, 8000);

    const handler = () => {
      clearTimeout(timeout);
      try {
        if (iframeRef.current?.contentDocument?.title) {
          onTitleChange?.(iframeRef.current.contentDocument.title);
        }
      } catch (e) {
        // Cross-origin error — это нормально для многих сайтов
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener('load', handler);

    return () => {
      clearTimeout(timeout);
      iframe?.removeEventListener('load', handler);
    };
  }, [url, onTitleChange]);

  const openInBrowser = async () => {
    await shell.open(url);
  };

  if (!url) return null;

  return (
    <div className="fixed inset-2.5 top-12 bottom-2.5 left-2.5 right-2.5 z-10 bg-white rounded-lg overflow-hidden shadow-2xl">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
        title="webview"
      />
      {(loadError || loadTimeout) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center p-8 rounded-2xl bg-black/80 border-2 border-[#ff0040] shadow-[0_0_20px_#ff0040] max-w-md">
            <div className="text-3xl mb-4">⚠️</div>
            <div className="text-2xl text-white mb-3">Site blocked iframe</div>
            <div className="text-white/70 mb-6">
              {loadTimeout ? 'This site is loading too slowly or blocked iframe.' : 'This site does not allow loading inside applications.'}
            </div>
            <button
              onClick={openInBrowser}
              className="px-6 py-3 rounded-full bg-[#ff0040] text-white font-semibold hover:bg-[#ff0040]/80 transition shadow-[0_0_15px_#ff0040]"
            >
              Open in system browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};