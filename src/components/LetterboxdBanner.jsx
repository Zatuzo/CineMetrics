// src/components/LetterboxdBanner.jsx
import React from 'react';
import { Sparkles, Star, Film, Bookmark, Clock } from 'lucide-react';
import { calculateCinematicPersona } from '../data/personas';

export default function LetterboxdBanner({ diary = [], watchlist = [], onNavigate }) {
  const persona = calculateCinematicPersona(diary);
  const totalHours = (diary.reduce((acc, f) => acc + (f.runtime || 110), 0) / 60).toFixed(0);
  const fiveStarsCount = diary.filter(f => Number(f.rating || f.Rating) === 5).length;

  return (
    <section className="lb-welcome-banner">
      <div className="lb-banner-content">
        <div className="lb-welcome-title">
          Welcome back, <span className="lb-user-highlight" onClick={() => onNavigate('home')}>Zatuzo</span>. Here’s what’s happening in your cinema diary...
        </div>

        {/* Minimalist Stat Badges */}
        <div className="lb-banner-stats">
          <div className="lb-stat-pill" onClick={() => onNavigate('home')} title="Total diary screenings">
            <Film size={12} style={{ color: '#00e054' }} />
            <span><b>{diary.length}</b> Films</span>
          </div>

          <div className="lb-stat-pill" onClick={() => onNavigate('home')} title="5-Star Masterpieces">
            <Star size={12} fill="#ff8000" color="#ff8000" />
            <span><b>{fiveStarsCount}</b> Masterpieces</span>
          </div>

          <div className="lb-stat-pill" onClick={() => onNavigate('semantic')} title="Unwatched Watchlist Queue">
            <Bookmark size={12} style={{ color: '#40bcf4' }} />
            <span><b>{watchlist.length}</b> Watchlist</span>
          </div>

          <div className="lb-stat-pill" onClick={() => onNavigate('analytics')} title="Total Watch Hours">
            <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
            <span><b>{totalHours}</b> hrs</span>
          </div>

          <div className="lb-stat-pill lb-persona-pill" onClick={() => onNavigate('rewind')} title="Your taste persona">
            <Sparkles size={12} style={{ color: 'var(--accent-red)' }} />
            <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{persona}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
