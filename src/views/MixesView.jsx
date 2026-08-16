// src/views/MixesView.jsx
import React, { useState, useEffect } from 'react';
import { buildCinemaMixes, populateMixDiscoveries } from '../services/mixEngine';
import { Star, Film, Sparkles } from 'lucide-react';
import PosterImage from '../components/PosterImage';

export default function MixesView({ diary, watchlist, onSelectMovie, activeMix: initialActiveMix = null }) {
  const [mixes, setMixes] = useState(() => buildCinemaMixes(diary, watchlist, 6));
  const [selectedMixId, setSelectedMixId] = useState(initialActiveMix?.id || null);

  useEffect(() => {
    const baseMixes = buildCinemaMixes(diary, watchlist, 6);
    setMixes(baseMixes);
    if (!selectedMixId && baseMixes.length > 0) {
      setSelectedMixId(baseMixes[0].id);
    }

    // Populate unwatched discoveries from TMDb
    populateMixDiscoveries(baseMixes, diary).then(enriched => {
      setMixes(enriched);
    });
  }, [diary, watchlist]);

  if (mixes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <Film size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
        <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Log more films</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
          Mixes unlock once you log films across your favorite genres.
        </p>
      </div>
    );
  }

  const currentMix = mixes.find(m => m.id === selectedMixId) || mixes[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Cinema Mixes</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Unwatched discoveries tailored to your favorite genres.
        </p>
      </div>

      {/* Mix Selector Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '20px' }}>
        {mixes.map(mix => {
          const isSelected = currentMix?.id === mix.id;
          return (
            <div
              key={mix.id}
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--accent-red-border)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)'
              }}
              onClick={() => setSelectedMixId(mix.id)}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? 'var(--accent-red)' : 'var(--text-primary)', marginBottom: '2px' }}>
                {mix.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {mix.films.length} recommendations
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
          padding: '18px'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {currentMix.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {currentMix.description}
              </p>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {currentMix.films.length} films
            </div>
          </div>

          {/* Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {currentMix.films.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading recommendations...
              </div>
            ) : (
              currentMix.films.map((film, idx) => {
                const ratingDisplay = film.rating ? `★ ${Number(film.rating).toFixed(1)}` : '★ 4.0';

                return (
                  <div
                    key={film.id || film.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 40px 1fr 140px 70px',
                      alignItems: 'center',
                      padding: '7px 10px',
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
                    <div style={{ width: '34px', height: '50px', borderRadius: '3px', overflow: 'hidden' }}>
                      <PosterImage
                        src={film.poster}
                        name={film.name}
                        year={film.year}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {film.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {film.year || 'N/A'} • {film.genre || currentMix.genre}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {film.director && film.director !== 'Unknown Director' && film.director !== 'Auteur' ? film.director.split(',')[0] : 'Director'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)', fontWeight: '600', fontSize: '12px', justifyContent: 'flex-end' }}>
                      <Star size={11} fill="currentColor" />
                      <span>{film.rating ? Number(film.rating).toFixed(1) : '4.0'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
