// src/components/Topbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Upload, Film, Star } from 'lucide-react';
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
    }, 280);

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
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="What do you want to watch or log? (Live TMDb Search)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setIsOpen(true)}
        />

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '48px',
            left: 0,
            right: 0,
            background: '#121824',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '14px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            zIndex: 50,
            overflow: 'hidden',
            maxHeight: '360px',
            overflowY: 'auto'
          }}>
            {isSearching ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Searching TMDb database...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No films found matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map(movie => (
                <div
                  key={movie.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1a2336'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    onSelectMovie({
                      name: movie.title,
                      year: movie.year,
                      poster: movie.posterUrl,
                      rating: movie.rating / 2, // convert 10 to 5
                      overview: movie.overview,
                      director: 'TMDb Auteur'
                    });
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <img
                    src={movie.posterUrl || 'https://via.placeholder.com/92x138/182234/94a3b8?text=No+Poster'}
                    alt={movie.title}
                    style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={11} fill="#f59e0b" /> {movie.rating}
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
          <Upload size={15} />
          <span>Sync Letterboxd</span>
        </button>
        <button className="btn-primary" onClick={onOpenQuickLog}>
          <Plus size={16} />
          <span>Quick Log</span>
        </button>
      </div>
    </header>
  );
}
