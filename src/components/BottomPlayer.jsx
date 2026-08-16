// src/components/BottomPlayer.jsx
import React from 'react';
import { Play, Star, Info, PlusCircle, Sparkles, ExternalLink, Heart } from 'lucide-react';

export default function BottomPlayer({ activeMovie, onOpenQuickLog }) {
  if (!activeMovie) {
    return (
      <footer className="bottom-dock">
        <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#38bdf8" />
          <span>Click any movie card to inspect details, auteuring notes, and ratings.</span>
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
          src={activeMovie.poster || 'https://via.placeholder.com/92x138/182234/94a3b8?text=No+Poster'}
          alt={activeMovie.name}
          className="dock-thumb"
        />
        <div className="dock-details">
          <div className="dock-title">{activeMovie.name}</div>
          <div className="dock-meta">
            {activeMovie.year} • {activeMovie.director || 'Auteur'} • {activeMovie.genre || 'Cinema'}
          </div>
        </div>
      </div>

      {/* Center: Rating & Meta Synopsis */}
      <div className="dock-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '700',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            {ratingStr}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {activeMovie.runtime ? `⏱️ ${activeMovie.runtime} min` : 'Feature Film'}
          </span>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          maxWidth: '480px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center'
        }}>
          {activeMovie.overview || 'Masterpiece in personal diary collection.'}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => onOpenQuickLog(activeMovie)}
        >
          <PlusCircle size={14} />
          <span>Log Review</span>
        </button>
      </div>
    </footer>
  );
}
