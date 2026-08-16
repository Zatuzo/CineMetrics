// src/views/SemanticView.jsx
import React, { useState, useMemo } from 'react';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { searchWatchlistByVibe } from '../services/semanticSearch';

export default function SemanticView({ watchlist, onSelectMovie }) {
  const [query, setQuery] = useState('atmospheric psychological neo noir');
  const [expandedId, setExpandedId] = useState(null);

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
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Vibe Search</h1>
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
            placeholder="Type a mood or plot prompt (e.g. atmospheric crime thriller in LA)..."
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

      {/* Watchlist Vibe Matches */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <Compass size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Your watchlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Sync your Letterboxd <b>watchlist.csv</b> to search unwatched film synopses by vibe.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {results.map(movie => {
            const isExpanded = expandedId === movie.id;
            return (
              <div
                key={movie.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'background var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                onClick={() => onSelectMovie(movie)}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <img
                    src={movie.poster || 'https://via.placeholder.com/90x135/181818/666666?text=Poster'}
                    alt={movie.name}
                    style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: '3px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--accent-red-subtle)',
                      color: 'var(--accent-red)',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: '700',
                      marginBottom: '3px'
                    }}>
                      {movie.matchScore}% Match
                    </div>

                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {movie.year} • {movie.director || 'Director'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.genre}
                    </div>
                  </div>
                </div>

                {/* Synopsis Accordion */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : movie.id);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <span>Synopsis</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                      {movie.overview || 'No synopsis available.'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
