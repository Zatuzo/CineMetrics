// src/components/Sidebar.jsx
import React from 'react';
import { 
  Home, 
  Sparkles, 
  Disc3, 
  Compass, 
  BarChart2, 
  Upload, 
  Film
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, onOpenUpload, totalFilms = 0 }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rewind', label: 'Monthly Rewind', icon: Sparkles },
    { id: 'mixes', label: 'Cinema Mixes', icon: Disc3 },
    { id: 'semantic', label: 'Vibe Search', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div className="brand-logo" onClick={() => setTab('home')}>
          <div className="brand-icon">
            <Film size={16} strokeWidth={2.5} />
          </div>
          <span className="brand-text">Cinefy</span>
        </div>

        {/* Navigation Sections */}
        <div className="nav-section">
          <div className="nav-label">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-label">Data</div>
          <div
            className="nav-item"
            onClick={onOpenUpload}
          >
            <Upload size={16} />
            <span>Sync Letterboxd</span>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="sidebar-footer-card">
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
          Logged Films
        </div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {totalFilms} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>entries</span>
        </div>
      </div>
    </aside>
  );
}
