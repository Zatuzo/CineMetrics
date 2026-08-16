// src/components/Sidebar.jsx
import React from 'react';
import { 
  Film, 
  Sparkles, 
  Clapperboard, 
  Compass, 
  BarChart3, 
  Ticket,
  Upload
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, onOpenUpload, totalFilms = 0 }) {
  const navItems = [
    { id: 'home', label: 'Now Showing', icon: Clapperboard },
    { id: 'rewind', label: 'Monthly Reel', icon: Sparkles },
    { id: 'mixes', label: 'Curated Double Features', icon: Film },
    { id: 'semantic', label: 'Mood Screenings', icon: Compass },
    { id: 'analytics', label: 'Theatre Ledger', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div className="brand-logo" onClick={() => setTab('home')}>
          <div className="brand-icon">
            <Ticket size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-text">CINEFY</span>
              <span className="brand-badge">THEATRE</span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="nav-section">
          <div className="nav-label">Auditorium & Programme</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-label">Your Box Office</div>
          <div
            className="nav-item"
            onClick={onOpenUpload}
          >
            <Upload size={18} />
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
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #e11d48 0%, #881337 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#fff1f2',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            🎬
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff1f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Auditorium Diary
            </div>
            <div style={{ fontSize: '11px', color: '#fda4af' }}>
              {totalFilms} films archived
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
