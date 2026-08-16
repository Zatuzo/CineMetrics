// src/components/HeroPersona.jsx
import React from 'react';
import { Sparkles, Clock, Film, Star, Award } from 'lucide-react';

export default function HeroPersona({ persona, totalHours, totalFilms, meanRating, topDirector, monthName = 'March 2024' }) {
  return (
    <div className="hero-stage">
      <div className="hero-glow" />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-tag">
          <Sparkles size={13} />
          <span>Cinematic Taste Persona // {monthName}</span>
        </div>

        <h1 className="hero-title">✨ {persona}</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '640px' }}>
          Your algorithmic cinematic identity based on your recent viewing velocity, auteur density, and genre signatures.
        </p>

        <div className="hero-kpis">
          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="#38bdf8" />
              <span>Watch Time</span>
            </div>
            <div className="kpi-value" style={{ color: '#38bdf8' }}>
              {totalHours.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>hrs</span>
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Film size={13} color="#10b981" />
              <span>Films Logged</span>
            </div>
            <div className="kpi-value" style={{ color: '#10b981' }}>
              {totalFilms} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>films</span>
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={13} color="#f59e0b" />
              <span>Mean Rating</span>
            </div>
            <div className="kpi-value" style={{ color: '#f59e0b' }}>
              ★ {meanRating ? meanRating.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={13} color="#a855f7" />
              <span>Top Auteur</span>
            </div>
            <div className="kpi-value" style={{ color: '#f8fafc', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topDirector || 'Various'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
