// src/components/Topbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Ticket, Upload, Star } from 'lucide-react';
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
        <Search className="search-icon" size={17} />
        <input
          type="text"
          className="search-input"
          placeholder="Search films in the global marquee (TMDb)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setIsOpen(true)}
        />

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '46px',
            left: 0,
            right: 0,
            background: '#14090d',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
            zIndex: 50,
            overflow: 'hidden',
            maxHeight: '360px',
            overflowY: 'auto'
          }}>
            {isSearching ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#fda4af', fontSize: '13px' }}>
                Searching marquee database...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#fda4af', fontSize: '13px' }}>
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
                    borderBottom: '1px solid rgba(225, 29, 72, 0.1)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#260f15'}
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
                    src={movie.posterUrl || 'https://via.placeholder.com/92x138/17090d/fda4af?text=No+Poster'}
                    alt={movie.title}
                    style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: '700', color: '#fff1f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={11} fill="#fbbf24" /> {movie.rating}
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
          <Upload size={14} />
          <span>Sync Letterboxd</span>
        </button>
        <button className="btn-primary" onClick={onOpenQuickLog}>
          <Ticket size={15} />
          <span>Log Screening</span>
        </button>
      </div>
    </header>
  );
}
