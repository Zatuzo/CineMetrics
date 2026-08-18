// src/components/CinefyHeroBanner.jsx
import React from 'react';
import { Sparkles, Star, Film, Bookmark, Clock, Flame } from 'lucide-react';
import { calculateCinematicPersona } from '../data/personas';

export default function CinefyHeroBanner({ diary = [], watchlist = [], onNavigate }) {
  const persona = calculateCinematicPersona(diary);
  const totalHours = (diary.reduce((acc, f) => acc + (f.runtime || 110), 0) / 60).toFixed(0);
  const fiveStarsCount = diary.filter(f => Number(f.rating || f.Rating) === 5).length;
  const ratings = diary.filter(f => f.rating || f.Rating).map(f => Number(f.rating || f.Rating));
  const meanRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 'N/A';

  return (
    <section className="cf-hero-banner">
      <div className="cf-banner-inner">
        <div className="cf-banner-left">
          <div className="cf-welcome-label">
            <span>TASTE INTELLIGENCE DASHBOARD</span>
          </div>
          <div className="cf-welcome-headline">
            Welcome back, <span className="cf-user-name" onClick={() => onNavigate('home')}>Zatuzo</span>
          </div>
        </div>

        {/* Minimalist Glass Stat Pills */}
        <div className="cf-banner-stats">
          <div className="cf-stat-chip" onClick={() => onNavigate('home')} title="Screenings in your diary">
            <Film size={13} style={{ color: 'var(--accent-ruby)' }} />
            <span><b>{diary.length}</b> Screenings</span>
          </div>

          <div className="cf-stat-chip" onClick={() => onNavigate('home')} title="★5.0 Perfect Masterpieces">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span><b>{fiveStarsCount}</b> Masterpieces</span>
          </div>

          <div className="cf-stat-chip" onClick={() => onNavigate('semantic')} title="Unwatched Watchlist Queue">
            <Bookmark size={13} style={{ color: '#06b6d4' }} />
            <span><b>{watchlist.length}</b> Watchlist</span>
          </div>

          <div className="cf-stat-chip" onClick={() => onNavigate('analytics')} title="Total Screening Time">
            <Clock size={13} style={{ color: '#94a3b8' }} />
            <span><b>{totalHours}</b> hrs (★ {meanRating})</span>
          </div>

          <div className="cf-stat-chip cf-persona-chip" onClick={() => onNavigate('rewind')} title="Your Cinephile Persona">
            <Sparkles size={13} style={{ color: 'var(--accent-ruby)' }} />
            <span className="cf-persona-text">{persona}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
