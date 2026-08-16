// src/components/Topbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Upload, Star } from 'lucide-react';
import { searchTMDbMovies } from '../services/tmdb';

export default function Topbar({ onOpenQuickLog, onOpenUpload, onSelectMovie }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchTMDbMovies(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      {/* Live TMDb Search Bar */}
      <div className="search-bar-container" ref={dropdownRef}>
        <Search className="search-icon" size={15} />
        <input
          type="text"
          className="search-input"
          placeholder="Search movies on TMDb..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setIsOpen(true)}
        />

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '42px',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-sm)',
            zIndex: 50,
            overflow: 'hidden',
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {isSearching ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              searchResults.map(movie => (
                <div
                  key={movie.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    onSelectMovie({
                      name: movie.title,
                      year: movie.year,
                      poster: movie.posterUrl,
                      rating: movie.rating / 2,
                      overview: movie.overview,
                      director: 'TMDb Auteur'
                    });
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <img
                    src={movie.posterUrl || 'https://via.placeholder.com/92x138/181818/666666?text=No+Poster'}
                    alt={movie.title}
                    style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '3px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={10} fill="currentColor" /> {movie.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions">
        <button className="btn-secondary" onClick={onOpenUpload}>
          <Upload size={13} />
          <span>Sync Letterboxd</span>
        </button>
        <button className="btn-primary" onClick={onOpenQuickLog}>
          <Plus size={14} />
          <span>Log Film</span>
        </button>
      </div>
    </header>
  );
}
