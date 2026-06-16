import { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login, register, profile, logout } = useProfile();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      if (register(username, password)) {
        onClose();
        setUsername('');
        setPassword('');
      } else {
        setError('Username already exists');
      }
    } else {
      if (login(username, password)) {
        onClose();
        setUsername('');
        setPassword('');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box' as const
  };

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
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 0 40px rgba(255,0,64,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: 'white', fontSize: '24px', margin: 0 }}>
            {profile ? '👤 Profile' : (isRegister ? '📝 Register' : '🔐 Login')}
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

        {profile ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff0040, #ff0066)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {profile.avatar}
              </div>
              <div>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                  {profile.username}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255,0,64,0.2)',
                border: '1px solid #ff0040',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            {error && (
              <div style={{
                color: '#ff0040',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff0040, #ff0066)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '12px',
                boxShadow: '0 4px 15px rgba(255,0,64,0.4)'
              }}
            >
              {isRegister ? 'Register' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isRegister ? 'Already have an account? Login' : 'No account? Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};