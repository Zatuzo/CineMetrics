// src/views/SemanticView.jsx
import React, { useState, useMemo } from 'react';
import { Compass, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { searchWatchlistByVibe } from '../services/semanticSearch';

export default function SemanticView({ watchlist, onSelectMovie }) {
  const [query, setQuery] = useState('atmospheric psychological neo noir');
  const [expandedId, setExpandedId] = useState(null);

  const vibePresets = [
    'atmospheric psychological neo noir',
    'futuristic mind bending sci-fi',
    'heartbreaking melancholy romance',
    'gritty crime investigation',
    'meditative poetic slow burn'
  ];

  const results = useMemo(() => {
    return searchWatchlistByVibe(watchlist, query);
  }, [watchlist, query]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>🔍 The Mood Screening Room</h1>
        <p style={{ color: '#fda4af', fontSize: '13px' }}>
          Discover what to screen from your watchlist by describing the exact cinematic mood, pacing, or aesthetic.
        </p>
      </div>

      {/* Query Search Bar */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ position: 'relative' }}>
          <Compass size={17} style={{ position: 'absolute', left: '16px', top: '15px', color: '#e11d48' }} />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '44px',
              height: '46px',
              fontSize: '14px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(225, 29, 72, 0.3)'
            }}
            placeholder="Type a cinematic mood or aesthetic prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Preset Vibe Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {vibePresets.map(preset => (
          <button
            key={preset}
            className={query === preset ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setQuery(preset)}
          >
            <span>{preset}</span>
          </button>
        ))}
      </div>

      {/* Watchlist Vibe Matches */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <Compass size={36} color="#9f7580" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '16px', color: '#fff1f2' }}>Your watchlist is empty</h3>
          <p style={{ color: '#fda4af', fontSize: '13px', marginTop: '4px' }}>
            Sync your Letterboxd <b>watchlist.csv</b> to screen by mood and vibe.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {results.map(movie => {
            const isExpanded = expandedId === movie.id;
            return (
              <div
                key={movie.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => onSelectMovie(movie)}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img
                    src={movie.poster || 'https://via.placeholder.com/90x135/17090d/fda4af?text=Poster'}
                    alt={movie.name}
                    style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(225, 29, 72, 0.15)',
                      color: '#fecdd3',
                      border: '1px solid rgba(225, 29, 72, 0.3)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '800',
                      marginBottom: '4px'
                    }}>
                      <span>{movie.matchScore}% Match</span>
                    </div>

                    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: '700', color: '#fff1f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#fda4af', marginTop: '2px' }}>
                      {movie.year} • {movie.director || 'Auteur'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9f7580', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🏷️ {movie.genre}
                    </div>
                  </div>
                </div>

                {/* Synopsis Accordion */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: '#fda4af',
                    lineHeight: 1.4
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : movie.id);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600', color: '#fff1f2', marginBottom: isExpanded ? '4px' : 0 }}>
                    <span>Plot Synopsis</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '4px', color: '#fecdd3' }}>
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
