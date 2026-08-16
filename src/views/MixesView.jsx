// src/views/MixesView.jsx
import React, { useState } from 'react';
import { buildCinemaMixes } from '../services/mixEngine';
import { Star, Film } from 'lucide-react';

export default function MixesView({ diary, onSelectMovie, activeMix: initialActiveMix = null }) {
  const mixes = buildCinemaMixes(diary, 6);
  const [selectedMix, setSelectedMix] = useState(initialActiveMix || mixes[0] || null);

  if (mixes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <Film size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
        <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Log more films across diverse genres</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
          Mixes unlock once you log at least 2 films in a specific genre.
        </p>
      </div>
    );
  }

  const currentMix = selectedMix || mixes[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Cinema Mixes</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Personalized playlists blending your top genres and director staples.
        </p>
      </div>

      {/* Mix Selector Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {mixes.map(mix => {
          const isSelected = currentMix?.id === mix.id;
          return (
            <div
              key={mix.id}
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--accent-red-border)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)'
              }}
              onClick={() => setSelectedMix(mix)}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? 'var(--accent-red)' : 'var(--text-primary)', marginBottom: '2px' }}>
                {mix.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {mix.films.length} films
              </div>
            </div>
          );
        })}
      </div>

      {/* Mix Details Table */}
      {currentMix && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>
              {currentMix.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {currentMix.description}
            </p>
          </div>

          {/* Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentMix.films.map((film, idx) => (
              <div
                key={film.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 40px 1fr 140px 70px',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => onSelectMovie(film)}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600' }}>#{idx + 1}</div>
                <img
                  src={film.poster || 'https://via.placeholder.com/60x90/181818/666666?text=Poster'}
                  alt={film.name}
                  style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '3px' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {film.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {film.year} • {film.genre}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {film.director || 'Director'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)', fontWeight: '600', fontSize: '12px', justifyContent: 'flex-end' }}>
                  <Star size={11} fill="currentColor" />
                  <span>{film.rating ? Number(film.rating).toFixed(1) : 'Logged'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
