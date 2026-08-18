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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Vibe Search</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '3px' }}>
          Search your watchlist using descriptive mood phrases, emotional themes, and aesthetic keywords.
        </p>
      </div>

      {/* Query Search Bar */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ position: 'relative' }}>
          <Compass size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--accent-cyan)' }} />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '44px',
              height: '48px',
              fontSize: '15px',
              borderRadius: 'var(--radius-sm)'
            }}
            placeholder="Type a mood or aesthetic (e.g. atmospheric neo-noir in Tokyo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Preset Vibe Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {vibePresets.map(preset => (
          <button
            key={preset}
            className={query === preset ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}
            onClick={() => setQuery(preset)}
          >
            <span>{preset}</span>
          </button>
        ))}
      </div>

      {/* Watchlist Vibe Matches Grid */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#141a24', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Compass size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Your watchlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Sync your Letterboxd <b>watchlist.csv</b> to search unwatched film synopses by vibe.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
          {results.map(movie => (
            <div
              key={movie.id}
              className="media-card"
              onClick={() => onSelectMovie(movie)}
            >
              {/* Big Prominent Poster Container */}
              <div className="poster-wrapper">
                <PosterImage
                  src={movie.poster}
                  name={movie.name}
                  year={movie.year}
                  className="poster-img"
                />

                {/* Percentage Bubble in Upper Right Corner */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(10, 13, 20, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: '800',
                  zIndex: 2
                }}>
                  {movie.matchScore}% Match
                </div>
              </div>

              {/* Metadata Below Poster */}
              <div style={{ minWidth: 0 }}>
                <div className="card-title" title={movie.name}>
                  {movie.name}
                </div>
                
                <div className="card-meta">
                  <span>{movie.year || 'N/A'}{movie.director && movie.director !== 'Unknown Director' && movie.director !== 'Auteur' ? ` • ${movie.director.split(',')[0]}` : ''}</span>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
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
