// src/components/BottomPlayer.jsx
import React from 'react';
import { Film, Star, Ticket, Sparkles } from 'lucide-react';

export default function BottomPlayer({ activeMovie, onOpenQuickLog }) {
  if (!activeMovie) {
    return (
      <footer className="bottom-dock">
        <div style={{ color: '#9f7580', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={16} color="#e11d48" />
          <span>Select any film card in the auditorium to inspect notes, director credits, and ratings.</span>
        </div>
        <div />
        <div />
      </footer>
    );
  }

  const ratingStr = activeMovie.rating ? `★ ${Number(activeMovie.rating).toFixed(1)}` : 'Archived';

  return (
    <footer className="bottom-dock">
      {/* Left: Active Film Info */}
      <div className="dock-film-info">
        <img
          src={activeMovie.poster || 'https://via.placeholder.com/92x138/17090d/fda4af?text=Poster'}
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

      {/* Center: Rating & Screening Notes */}
      <div className="dock-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            {ratingStr}
          </span>
          <span style={{ fontSize: '12px', color: '#fda4af' }}>
            {activeMovie.runtime ? `⏱️ ${activeMovie.runtime} min screening` : 'Feature Film'}
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#9f7580',
          maxWidth: '480px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center'
        }}>
          {activeMovie.overview || activeMovie.review || 'Screening logged in personal cinema archive.'}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => onOpenQuickLog(activeMovie)}
        >
          <Ticket size={13} />
          <span>Edit Screening</span>
        </button>
      </div>
    </footer>
  );
}
