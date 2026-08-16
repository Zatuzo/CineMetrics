// src/views/SemanticView.jsx
import React, { useState, useMemo } from 'react';
import { Compass } from 'lucide-react';
import { searchWatchlistByVibe } from '../services/semanticSearch';
import PosterImage from '../components/PosterImage';

export default function SemanticView({ watchlist, onSelectMovie }) {
  const [query, setQuery] = useState('atmospheric psychological neo noir');

  const vibePresets = [
    'atmospheric psychological neo noir',
    'futuristic mind bending sci-fi',
    'melancholy romantic drama',
    'gritty crime thriller',
    'poetic slow burn'
  ];

  const results = useMemo(() => {
    return searchWatchlistByVibe(watchlist, query);
  }, [watchlist, query]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Vibe Search</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Search your watchlist using descriptive mood phrases and cinematic aesthetics.
        </p>
      </div>

      {/* Query Search Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Compass size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '36px',
              height: '40px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)'
            }}
            placeholder="Type a mood or aesthetic (e.g. atmospheric neo-noir in Tokyo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Preset Vibe Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {vibePresets.map(preset => (
          <button
            key={preset}
            className={query === preset ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '11px', padding: '5px 10px' }}
            onClick={() => setQuery(preset)}
          >
            <span>{preset}</span>
          </button>
        ))}
      </div>

      {/* Watchlist Vibe Matches (Vertical Big Poster Layout without redundant synopsis button) */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <Compass size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Your watchlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Sync your Letterboxd <b>watchlist.csv</b> to search unwatched film synopses by vibe.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {results.map(movie => (
            <div
              key={movie.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
              onClick={() => onSelectMovie(movie)}
            >
              {/* Big Prominent Poster Container */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px', background: '#111111' }}>
                <PosterImage
                  src={movie.poster}
                  name={movie.name}
                  year={movie.year}
                  className="poster-img"
                />

                {/* Percentage Bubble in Upper Right Corner */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'rgba(10, 10, 10, 0.88)',
                  backdropFilter: 'blur(6px)',
                  color: 'var(--accent-red)',
                  border: '1px solid var(--accent-red-border)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: '700',
                  zIndex: 2
                }}>
                  {movie.matchScore}%
                </div>
              </div>

              {/* Metadata Below Poster */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }} title={movie.name}>
                  {movie.name}
                </div>
                
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{movie.year || 'N/A'}{movie.director && movie.director !== 'Unknown Director' && movie.director !== 'Auteur' ? ` • ${movie.director.split(',')[0]}` : ''}</span>
                </div>
                
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {movie.genre || 'Cinema'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
