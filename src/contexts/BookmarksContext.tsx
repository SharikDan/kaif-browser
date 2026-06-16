import { createContext, useContext, useState, useEffect } from 'react';

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  favicon: string;
  createdAt: number;
};

interface BookmarksContextType {
  bookmarks: Bookmark[];
  addBookmark: (url: string, title: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (url: string) => boolean;
  toggleBookmark: (url: string, title: string) => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('kaif_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kaif_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const getFavicon = (url: string): string => {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch {
      return '';
    }
  };

  const addBookmark = (url: string, title: string) => {
    if (!url) return;
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      url,
      title: title || url,
      favicon: getFavicon(url),
      createdAt: Date.now()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (url: string): boolean => {
    return bookmarks.some(b => b.url === url);
  };

  const toggleBookmark = (url: string, title: string) => {
    if (isBookmarked(url)) {
      const bm = bookmarks.find(b => b.url === url);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark(url, title);
    }
  };

  return (
    <BookmarksContext.Provider value={{
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      toggleBookmark
    }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
};