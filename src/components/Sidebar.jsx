// src/components/Sidebar.jsx
import React from 'react';
import { 
  Home, 
  Disc3, 
  Sparkles, 
  Compass, 
  BarChart3, 
  Upload, 
  Film,
  Library
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, onOpenUpload, totalFilms = 0 }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rewind', label: 'Monthly Wrapped', icon: Sparkles },
    { id: 'mixes', label: 'Cinema Mixes', icon: Disc3 },
    { id: 'semantic', label: 'Vibe Search', icon: Compass },
    { id: 'analytics', label: 'Taste Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div className="brand-logo" onClick={() => setTab('home')}>
          <div className="brand-icon">
            <Film size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-text">Cinefy</span>
              <span className="brand-badge">PRO</span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="nav-section">
          <div className="nav-label">Discover & Taste</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-label">Your Library</div>
          <div
            className="nav-item"
            onClick={onOpenUpload}
          >
            <Upload size={19} />
            <span>Sync Letterboxd</span>
          </div>
        </div>
      </div>

      {/* Footer Profile / Sync Card */}
      <div className="sidebar-footer-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#07090e'
          }}>
            C
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Cinephile Diary
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {totalFilms} films logged
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
