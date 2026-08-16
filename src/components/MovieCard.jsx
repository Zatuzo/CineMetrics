// src/components/MovieCard.jsx
import React from 'react';
import { Star, Play } from 'lucide-react';

export default function MovieCard({ movie, onSelect, badge = null }) {
  if (!movie) return null;

  return (
    <div className="media-card" onClick={() => onSelect(movie)}>
      <div className="poster-wrapper">
        <img
          src={movie.poster || 'https://via.placeholder.com/300x450/141c2e/94a3b8?text=No+Poster'}
          alt={movie.name}
          className="poster-img"
          loading="lazy"
        />

        {/* Floating play / inspect circle button */}
        <div className="poster-overlay-play">
          <Play size={18} fill="#07090e" stroke="#07090e" style={{ marginLeft: '2px' }} />
        </div>

        {/* Optional rank or vibe match badge */}
        {badge && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: '800',
            color: '#f8fafc'
          }}>
            {badge}
          </div>
        )}
      </div>

      <div className="card-title" title={movie.name}>
        {movie.name}
      </div>

      <div className="card-meta">
        <span>{movie.year || 'N/A'} • {movie.director ? movie.director.split(',')[0] : 'Auteur'}</span>
        {movie.rating && (
          <div className="star-rating">
            <Star size={12} fill="#f59e0b" />
            <span>{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
