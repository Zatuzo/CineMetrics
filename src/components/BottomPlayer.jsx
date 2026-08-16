// src/components/BottomPlayer.jsx
import React from 'react';
import { Star, Plus } from 'lucide-react';

export default function BottomPlayer({ activeMovie, onOpenQuickLog }) {
  if (!activeMovie) {
    return (
      <footer className="bottom-dock">
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          Select any film to view metadata and log notes.
        </div>
        <div />
        <div />
      </footer>
    );
  }

  const ratingStr = activeMovie.rating ? `★ ${Number(activeMovie.rating).toFixed(1)}` : 'Logged';

  return (
    <footer className="bottom-dock">
      {/* Left: Active Film Info */}
      <div className="dock-film-info">
        <img
          src={activeMovie.poster || 'https://via.placeholder.com/92x138/181818/666666?text=Poster'}
          alt={activeMovie.name}
          className="dock-thumb"
        />
        <div className="dock-details">
          <div className="dock-title">{activeMovie.name}</div>
          <div className="dock-meta">
            {activeMovie.year} • {activeMovie.director || 'Director'} • {activeMovie.genre || 'Cinema'}
          </div>
        </div>
      </div>

      {/* Center: Rating & Notes */}
      <div className="dock-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'var(--accent-gold-subtle)',
            color: 'var(--accent-gold)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {ratingStr}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {activeMovie.runtime ? `${activeMovie.runtime} min` : 'Feature'}
          </span>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center'
        }}>
          {activeMovie.overview || activeMovie.review || 'No additional synopsis available.'}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '11px' }}
          onClick={() => onOpenQuickLog(activeMovie)}
        >
          <Plus size={12} />
          <span>Edit / Review</span>
        </button>
      </div>
    </footer>
  );
}
