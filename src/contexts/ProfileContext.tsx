import { createContext, useContext, useState, useEffect } from 'react';

export type UserProfile = {
  username: string;
  avatar: string;
  createdAt: number;
};

interface ProfileContextType {
  profile: UserProfile | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Простое "шифрование" (не для продакшена, но лучше чем plaintext)
const simpleEncode = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str))).split('').reverse().join('');
};

const simpleDecode = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str.split('').reverse().join(''))));
  } catch {
    return '';
  }
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kaif_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const getUsers = (): Record<string, string> => {
    const saved = localStorage.getItem('kaif_users');
    return saved ? JSON.parse(saved) : {};
  };

  const saveUsers = (users: Record<string, string>) => {
    localStorage.setItem('kaif_users', JSON.stringify(users));
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const stored = users[username];
    if (!stored) return false;
    if (simpleDecode(stored) !== password) return false;
    
    const userProfile: UserProfile = {
      username,
      avatar: username.charAt(0).toUpperCase(),
      createdAt: Date.now()
    };
    setProfile(userProfile);
    localStorage.setItem('kaif_profile', JSON.stringify(userProfile));
    return true;
  };

  const register = (username: string, password: string): boolean => {
    if (!username || !password) return false;
    const users = getUsers();
    if (users[username]) return false;
    
    users[username] = simpleEncode(password);
    saveUsers(users);
    
    const userProfile: UserProfile = {
      username,
      avatar: username.charAt(0).toUpperCase(),
      createdAt: Date.now()
    };
    setProfile(userProfile);
    localStorage.setItem('kaif_profile', JSON.stringify(userProfile));
    return true;
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('kaif_profile');
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!profile) return false;
    const users = getUsers();
    if (simpleDecode(users[profile.username]) !== oldPassword) return false;
    users[profile.username] = simpleEncode(newPassword);
    saveUsers(users);
    return true;
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoggedIn: !!profile,
      login,
      register,
      logout,
      changePassword
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};