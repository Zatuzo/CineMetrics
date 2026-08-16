// src/views/MixesView.jsx
import React, { useState } from 'react';
import { buildCinemaMixes } from '../services/mixEngine';
import { Disc3, Star, Clock, Play, Film } from 'lucide-react';

export default function MixesView({ diary, onSelectMovie, activeMix: initialActiveMix = null }) {
  const mixes = buildCinemaMixes(diary, 6);
  const [selectedMix, setSelectedMix] = useState(initialActiveMix || mixes[0] || null);

  if (mixes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px' }}>
        <Disc3 size={40} color="#38bdf8" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', color: '#f8fafc' }}>Log more films across genres to unlock Cinema Mixes</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Cinefy's algorithm generates custom mixes once you log at least 2 films per genre.
        </p>
      </div>
    );
  }

  const currentMix = selectedMix || mixes[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>🎧 Cinema Daily Mixes</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Personalized algorithmic playlists blending your favorite genres and auteur styles.
        </p>
      </div>

      {/* Mix selector cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {mixes.map(mix => {
          const isSelected = currentMix?.id === mix.id;
          return (
            <div
              key={mix.id}
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? mix.color : 'var(--border-subtle)'}`,
                borderRadius: '14px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 20px ${mix.color}33` : 'none'
              }}
              onClick={() => setSelectedMix(mix)}
            >
              <div style={{ height: '4px', width: '32px', background: mix.color, borderRadius: '9999px', marginBottom: '10px' }} />
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>{mix.title}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{mix.films.length} masterclasses</div>
            </div>
          );
        })}
      </div>

      {/* Playlist Hero / Detail View */}
      {currentMix && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${currentMix.color} 0%, #0f172a 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${currentMix.color}44`,
              color: '#07090e'
            }}>
              <Disc3 size={40} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: currentMix.color, letterSpacing: '0.05em' }}>
                PLAYLIST MIX
              </span>
              <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#f8fafc', margin: '4px 0' }}>{currentMix.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '600px' }}>{currentMix.description}</p>
            </div>
          </div>

          {/* Tracklist table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentMix.films.map((film, idx) => (
              <div
                key={film.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 54px 1fr 140px 80px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => onSelectMovie(film)}
              >
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>#{idx + 1}</div>
                <img
                  src={film.poster || 'https://via.placeholder.com/60x90/182234/94a3b8'}
                  alt={film.name}
                  style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {film.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {film.year} • {film.genre}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {film.director || 'Auteur'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '700', fontSize: '13px', justifyContent: 'flex-end' }}>
                  <Star size={13} fill="#f59e0b" />
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
