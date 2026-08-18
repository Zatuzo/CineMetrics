// src/components/CinefyHeroBanner.jsx
import React from 'react';
import { Sparkles, Star, Film, Bookmark, Clock } from 'lucide-react';
import { calculateCinematicPersona } from '../data/personas';

export default function CinefyHeroBanner({ diary = [], watchlist = [] }) {
  const persona = calculateCinematicPersona(diary);
  const totalHours = (diary.reduce((acc, f) => acc + (f.runtime || 110), 0) / 60).toFixed(0);
  const fiveStarsCount = diary.filter(f => Number(f.rating || f.Rating) === 5).length;
  const ratings = diary.filter(f => f.rating || f.Rating).map(f => Number(f.rating || f.Rating));
  const meanRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 'N/A';

  return (
    <section className="cf-hero-banner">
      <div className="cf-banner-inner">
        <div className="cf-banner-left">
          <div className="cf-welcome-headline">
            Welcome back, <span className="cf-user-name">Zatuzo</span>
          </div>
        </div>

        {/* Clean Static Informational Stat Badges */}
        <div className="cf-banner-stats">
          <div className="cf-stat-badge-item">
            <Film size={14} style={{ color: 'var(--accent-ruby)' }} />
            <span><b>{diary.length}</b> Films</span>
          </div>

          <div className="cf-stat-badge-item">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span><b>{fiveStarsCount}</b> Masterpieces</span>
          </div>

          <div className="cf-stat-badge-item">
            <Bookmark size={14} style={{ color: '#06b6d4' }} />
            <span><b>{watchlist.length}</b> Watchlist</span>
          </div>

          <div className="cf-stat-badge-item">
            <Clock size={14} style={{ color: '#94a3b8' }} />
            <span><b>{totalHours}</b> hrs (★ {meanRating})</span>
          </div>

          <div className="cf-stat-badge-item cf-persona-badge">
            <Sparkles size={14} style={{ color: 'var(--accent-ruby)' }} />
            <span className="cf-persona-text">{persona}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
