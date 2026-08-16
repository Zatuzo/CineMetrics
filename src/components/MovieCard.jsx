// src/components/MovieCard.jsx
import React from 'react';
import { Star, Film } from 'lucide-react';

export default function MovieCard({ movie, onSelect, badge = null }) {
  if (!movie) return null;

  return (
    <div className="media-card" onClick={() => onSelect(movie)}>
      <div className="poster-wrapper">
        <img
          src={movie.poster || 'https://via.placeholder.com/300x450/17090d/fda4af?text=Poster'}
          alt={movie.name}
          className="poster-img"
          loading="lazy"
        />

        {/* Overlay inspect icon */}
        <div className="poster-overlay-play">
          <Film size={16} fill="#ffffff" stroke="#ffffff" />
        </div>

        {/* Optional rank or vibe badge */}
        {badge && (
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            background: 'rgba(15, 5, 8, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '4px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: '800',
            color: '#fff1f2',
            letterSpacing: '0.04em'
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
            <Star size={11} fill="#fbbf24" />
            <span>{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
