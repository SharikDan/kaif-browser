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
    <div className="fixed inset-0 top-10 left-0 right-0 bottom-0 z-10 bg-transparent">
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
