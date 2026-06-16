import { useState } from 'react';
import { useTabs } from '../contexts/TabsContext';
import { useProfile } from '../contexts/ProfileContext';
import { appWindow } from '@tauri-apps/api/window';
import { LoginModal } from './LoginModal';
import { PasswordManager } from './PasswordManager';

export const TabBar = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();
  const { profile } = useProfile();
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleToggleMaximize = async () => {
    const isMax = await appWindow.isMaximized();
    if (isMax) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  return (
    <>
      <div
        data-tauri-drag-region
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '2px solid #ff0040',
          boxShadow: '0 2px 10px rgba(255,0,64,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0 8px',
          zIndex: 100,
          userSelect: 'none',
          WebkitAppRegion: 'drag' as any
        }}
      >
        {/* Зона вкладок — тоже перетаскиваемая */}
        <div 
          data-tauri-drag-region
          style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, overflowX: 'auto' }}
        >
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                background: activeTabId === tab.id ? 'rgba(255,0,64,0.3)' : 'transparent',
                color: activeTabId === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                boxShadow: activeTabId === tab.id ? 'inset 0 -2px 0 #ff0040' : 'none',
                fontSize: '14px',
                maxWidth: '180px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                maxWidth: '120px'
              }}>
                {tab.title.length > 20 ? tab.title.slice(0, 18) + '...' : tab.title}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '16px'
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button 
            onClick={() => addTab()} 
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            +
          </button>
        </div>

        {/* Кнопки профиля и паролей — НЕ перетаскиваемые */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
          <button
            onClick={() => setShowPasswords(true)}
            title="Saved Passwords"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔐
          </button>
          <button
            onClick={() => setShowLogin(true)}
            title={profile ? profile.username : 'Login'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: profile ? 'linear-gradient(135deg, #ff0040, #ff0066)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {profile ? profile.avatar : '👤'}
          </button>
        </div>

        {/* Кнопки окна — НЕ перетаскиваемые */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => appWindow.minimize()}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            −
          </button>
          <button
            onClick={handleToggleMaximize}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            □
          </button>
          <button
            onClick={() => appWindow.close()}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <PasswordManager isOpen={showPasswords} onClose={() => setShowPasswords(false)} />
    </>
  );
};