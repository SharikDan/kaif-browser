import { useState, useEffect } from 'react';

export type SavedPassword = {
  id: string;
  domain: string;
  username: string;
  password: string;
  createdAt: number;
};

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

export const getPasswords = (): SavedPassword[] => {
  const saved = localStorage.getItem('kaif_passwords');
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((p: any) => ({
      ...p,
      password: simpleDecode(p.password)
    }));
  } catch {
    return [];
  }
};

export const savePassword = (domain: string, username: string, password: string) => {
  const passwords = getPasswords();
  const existing = passwords.findIndex(p => p.domain === domain && p.username === username);
  
  const encoded = simpleEncode(password);
  const entry: SavedPassword = {
    id: Date.now().toString(),
    domain,
    username,
    password: encoded,
    createdAt: Date.now()
  };
  
  if (existing >= 0) {
    passwords[existing] = { ...passwords[existing], password: encoded };
  } else {
    passwords.push(entry);
  }
  
  localStorage.setItem('kaif_passwords', JSON.stringify(passwords));
};

export const deletePassword = (id: string) => {
  const passwords = getPasswords().filter(p => p.id !== id);
  localStorage.setItem('kaif_passwords', JSON.stringify(passwords.map(p => ({
    ...p,
    password: simpleEncode(p.password)
  }))));
};

export const findPassword = (domain: string): SavedPassword | undefined => {
  return getPasswords().find(p => p.domain === domain);
};

interface PasswordManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordManager = ({ isOpen, onClose }: PasswordManagerProps) => {
  const [passwords, setPasswords] = useState<SavedPassword[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setPasswords(getPasswords());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deletePassword(id);
    setPasswords(getPasswords());
  };

  const toggleShow = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '2px solid #ff0040',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 0 40px rgba(255,0,64,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: 'white', fontSize: '28px', margin: 0 }}>
            🔐 Saved Passwords
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {passwords.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            No saved passwords yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {passwords.map(p => (
              <div key={p.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ color: '#ff0040', fontWeight: 600 }}>
                    {p.domain}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '4px' }}>
                  Username: {p.username}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Password: {showPasswords[p.id] ? p.password : '••••••••'}
                  </span>
                  <button
                    onClick={() => toggleShow(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff0040',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {showPasswords[p.id] ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};