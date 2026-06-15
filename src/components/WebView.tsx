import React, { useEffect, useRef } from 'react';

interface WebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
}

export const WebView: React.FC<WebViewProps> = ({ url, onTitleChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!url) return;
    const handler = () => {
      try {
        if (iframeRef.current?.contentDocument?.title) {
          onTitleChange?.(iframeRef.current.contentDocument.title);
        }
      } catch (e) {}
    };
    iframeRef.current?.addEventListener('load', handler);
    return () => iframeRef.current?.removeEventListener('load', handler);
  }, [url]);

  if (!url) return null;

  return (
    <div className="fixed inset-2.5 top-12 bottom-2.5 left-2.5 right-2.5 z-10 bg-transparent rounded-lg overflow-hidden shadow-2xl">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
        title="webview"
      />
    </div>
  );
};