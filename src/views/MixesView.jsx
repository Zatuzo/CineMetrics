// src/views/MixesView.jsx
import React, { useState } from 'react';
import { buildCinemaMixes } from '../services/mixEngine';
import { Film, Star, Clapperboard } from 'lucide-react';

export default function MixesView({ diary, onSelectMovie, activeMix: initialActiveMix = null }) {
  const mixes = buildCinemaMixes(diary, 6);
  const [selectedMix, setSelectedMix] = useState(initialActiveMix || mixes[0] || null);

  if (mixes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
        <Film size={36} color="#e11d48" style={{ marginBottom: '10px' }} />
        <h3 style={{ fontSize: '16px', color: '#fff1f2' }}>Log more films to curate Double Features</h3>
        <p style={{ color: '#fda4af', fontSize: '13px', marginTop: '4px' }}>
          Programmes unlock automatically once you log at least 2 screenings per genre.
        </p>
      </div>
    );
  }

  const currentMix = selectedMix || mixes[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>🎬 Curated Double Features & Programmes</h1>
        <p style={{ color: '#fda4af', fontSize: '13px' }}>
          Thematic cinema bills curated by genre and auteur signatures.
        </p>
      </div>

      {/* Mix selector cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {mixes.map(mix => {
          const isSelected = currentMix?.id === mix.id;
          return (
            <div
              key={mix.id}
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? '#e11d48' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 16px rgba(225, 29, 72, 0.25)' : 'none'
              }}
              onClick={() => setSelectedMix(mix)}
            >
              <div style={{ height: '3px', width: '28px', background: '#e11d48', borderRadius: '9999px', marginBottom: '8px' }} />
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: '700', color: '#fff1f2', marginBottom: '3px' }}>{mix.title}</div>
              <div style={{ fontSize: '11px', color: '#fda4af' }}>{mix.films.length} curated masterclasses</div>
            </div>
          );
        })}
      </div>

      {/* Selected Programme Details */}
      {currentMix && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(38, 14, 20, 0.8) 0%, rgba(15, 5, 8, 0.98) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(225, 29, 72, 0.3)',
              color: '#ffffff'
            }}>
              <Clapperboard size={32} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#e11d48', letterSpacing: '0.06em' }}>
                THEATRE PROGRAMME
              </span>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '26px', fontWeight: '800', color: '#fff1f2', margin: '3px 0' }}>{currentMix.title}</h2>
              <p style={{ color: '#fda4af', fontSize: '13px', maxWidth: '600px' }}>{currentMix.description}</p>
            </div>
          </div>

          {/* Programme film list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentMix.films.map((film, idx) => (
              <div
                key={film.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '30px 48px 1fr 140px 80px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(225, 29, 72, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => onSelectMovie(film)}
              >
                <div style={{ color: '#9f7580', fontSize: '12px', fontWeight: '700' }}>#{idx + 1}</div>
                <img
                  src={film.poster || 'https://via.placeholder.com/60x90/17090d/fda4af?text=Poster'}
                  alt={film.name}
                  style={{ width: '38px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: '700', color: '#fff1f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {film.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fda4af' }}>
                    {film.year} • {film.genre}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#fda4af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {film.director || 'Auteur'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: '700', fontSize: '13px', justifyContent: 'flex-end' }}>
                  <Star size={12} fill="#fbbf24" />
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
