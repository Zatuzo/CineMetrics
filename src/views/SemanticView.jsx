// src/views/SemanticView.jsx
import React, { useState, useMemo } from 'react';
import { Compass, Sparkles, Star, ChevronDown, ChevronUp } from 'lucide-react';
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
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>🔍 Semantic Mood & Vibe Search</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Discover what to watch from your watchlist by describing the exact cinematic mood or pacing.
        </p>
      </div>

      {/* Query Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Compass size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#38bdf8' }} />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '46px',
              height: '48px',
              fontSize: '15px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
            placeholder="Type a cinematic vibe or plot prompt..."
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
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => setQuery(preset)}
          >
            <Sparkles size={12} />
            <span>{preset}</span>
          </button>
        ))}
      </div>

      {/* Watchlist Vibe Matches */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: '16px' }}>
          <Compass size={36} color="#64748b" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '16px', color: '#f8fafc' }}>Your watchlist is empty</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Sync your Letterboxd <b>watchlist.csv</b> to enable semantic mood searching.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {results.map(movie => {
            const isExpanded = expandedId === movie.id;
            return (
              <div
                key={movie.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => onSelectMovie(movie)}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img
                    src={movie.poster || 'https://via.placeholder.com/90x135/141c2e/94a3b8?text=Poster'}
                    alt={movie.name}
                    style={{ width: '64px', height: '96px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      marginBottom: '6px'
                    }}>
                      <Sparkles size={10} />
                      <span>{movie.matchScore}% Vibe Match</span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {movie.year} • {movie.director || 'Auteur'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🏷️ {movie.genre}
                    </div>
                  </div>
                </div>

                {/* Synopsis Accordion */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    lineHeight: 1.4
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : movie.id);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600', color: '#f8fafc', marginBottom: isExpanded ? '4px' : 0 }}>
                    <span>Plot Synopsis</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '4px', color: '#cbd5e1' }}>
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
