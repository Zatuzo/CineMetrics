// src/components/HeroPersona.jsx
import React from 'react';
import { Film, Clock, Star, Trophy, Sparkles } from 'lucide-react';

export default function HeroPersona({ persona, totalHours, totalFilms, meanRating, topDirector, monthName = 'March 2024' }) {
  return (
    <div className="hero-stage">
      <div className="hero-glow" />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-tag">
          <Film size={12} />
          <span>Auditorium Programme // {monthName}</span>
        </div>

        <h1 className="hero-title">🎬 {persona}</h1>
        <p style={{ color: '#fda4af', fontSize: '14px', maxWidth: '640px', lineHeight: 1.5 }}>
          Your curated cinematic identity derived from your recent theatrical logs, auteur frequency, and dominant genre reels.
        </p>

        <div className="hero-kpis">
          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} color="#e11d48" />
              <span>Screen Time</span>
            </div>
            <div className="kpi-value" style={{ color: '#e11d48' }}>
              {totalHours.toFixed(1)} <span style={{ fontSize: '13px', fontWeight: '500', color: '#9f7580' }}>hrs</span>
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Film size={12} color="#f43f5e" />
              <span>Films Screened</span>
            </div>
            <div className="kpi-value" style={{ color: '#fff1f2' }}>
              {totalFilms} <span style={{ fontSize: '13px', fontWeight: '500', color: '#9f7580' }}>titles</span>
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={12} color="#fbbf24" />
              <span>Mean Rating</span>
            </div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>
              ★ {meanRating ? meanRating.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={12} color="#fbbf24" />
              <span>Top Auteur</span>
            </div>
            <div className="kpi-value" style={{ color: '#fff1f2', fontSize: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topDirector || 'Various'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
