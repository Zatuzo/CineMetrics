// src/components/HeroPersona.jsx
import React from 'react';

export default function HeroPersona({ persona, totalHours, totalFilms, meanRating, topDirector, monthName = 'Overview' }) {
  return (
    <div className="hero-stage">
      <div>
        <div className="hero-tag">
          {monthName} Persona
        </div>

        <h1 className="hero-title">{persona}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '600px', lineHeight: 1.5 }}>
          Your dominant cinematic taste profile calculated from your recent watch history and director frequency.
        </p>

        <div className="hero-kpis">
          <div className="kpi-tile">
            <div className="kpi-label">Watch Time</div>
            <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>
              {totalHours.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>hrs</span>
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label">Films Logged</div>
            <div className="kpi-value">
              {totalFilms}
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label">Mean Rating</div>
            <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>
              ★ {meanRating ? meanRating.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="kpi-tile">
            <div className="kpi-label">Top Director</div>
            <div className="kpi-value" style={{ fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topDirector || 'Various'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
