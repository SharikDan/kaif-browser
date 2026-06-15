import React from 'react';
import { useTabs } from '../contexts/TabsContext';
import { appWindow } from '@tauri-apps/api/window';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();

  return (
    <div
      data-tauri-drag-region
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #ff0040',
        boxShadow: '0 1px 0 #ff0040',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 8px',
        zIndex: 30,
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, overflowX: 'auto' }}>
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
              background: activeTabId === tab.id ? 'rgba(255,0,64,0.2)' : 'transparent',
              color: activeTabId === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              boxShadow: activeTabId === tab.id ? 'inset 0 -2px 0 #ff0040' : 'none',
              fontSize: '14px',
              maxWidth: '180px'
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
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
          onClick={async () => {
            const isMax = await appWindow.isMaximized();
            if (isMax) await appWindow.unmaximize();
            else await appWindow.maximize();
          }}
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
  );
};