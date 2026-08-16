// src/components/MovieCard.jsx
import React from 'react';
import { Star } from 'lucide-react';

export default function MovieCard({ movie, onSelect, badge = null }) {
  if (!movie) return null;

  return (
    <div className="media-card" onClick={() => onSelect(movie)}>
      <div className="poster-wrapper">
        <img
          src={movie.poster || 'https://via.placeholder.com/300x450/181818/555555?text=No+Poster'}
          alt={movie.name}
          className="poster-img"
          loading="lazy"
        />

        {/* Optional rank badge */}
        {badge && (
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            background: 'rgba(10, 10, 10, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            {badge}
          </div>
        )}
      </div>

      <div className="card-title" title={movie.name}>
        {movie.name}
      </div>

      <div className="card-meta">
        <span>{movie.year || 'N/A'} • {movie.director ? movie.director.split(',')[0] : 'Director'}</span>
        {movie.rating && (
          <div className="star-rating">
            <Star size={11} fill="currentColor" />
            <span>{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
