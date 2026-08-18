// src/components/LetterboxdNav.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Upload, Star, Sparkles, ChevronDown, Film, User, Compass, Disc3, BarChart2 } from 'lucide-react';
import { searchTMDbMovies } from '../services/tmdb';

export default function LetterboxdNav({ 
  currentTab, 
  setTab, 
  onOpenQuickLog, 
  onOpenUpload, 
  onSelectMovie,
  totalFilms = 0,
  watchlistCount = 0
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const searchDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchTMDbMovies(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setIsSearchOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'FILMS' },
    { id: 'rewind', label: 'REWIND', icon: Sparkles },
    { id: 'mixes', label: 'MIXES' },
    { id: 'semantic', label: 'VIBE SEARCH' },
    { id: 'analytics', label: 'ANALYTICS' }
  ];

  return (
    <header className="lb-header">
      <div className="lb-nav-container">
        {/* 1. Left: Iconic Cinefy Brand Logo */}
        <div className="lb-brand-group" onClick={() => setTab('home')}>
          <div className="lb-dots">
            <span className="lb-dot dot-orange" />
            <span className="lb-dot dot-green" />
            <span className="lb-dot dot-blue" />
          </div>
          <span className="lb-logo-text">Cinefy</span>
        </div>

        {/* 2. Middle: Navigation Links */}
        <nav className="lb-nav-links">
          {/* User Profile Dropdown */}
          <div className="lb-profile-item" ref={profileDropdownRef}>
            <button 
              className={`lb-profile-btn ${isProfileOpen ? 'active' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="lb-avatar">
                <User size={13} />
              </div>
              <span className="lb-username">ZATUZO</span>
              <ChevronDown size={11} className="lb-chevron" />
            </button>

            {isProfileOpen && (
              <div className="lb-profile-menu">
                <div className="lb-profile-header">
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>Zatuzo</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Letterboxd Cinephile</div>
                </div>
                <div className="lb-menu-divider" />
                <div className="lb-profile-stat">
                  <span>Watched Diary</span>
                  <span className="lb-stat-badge">{totalFilms}</span>
                </div>
                <div className="lb-profile-stat">
                  <span>Watchlist Queue</span>
                  <span className="lb-stat-badge">{watchlistCount}</span>
                </div>
                <div className="lb-menu-divider" />
                <button className="lb-menu-btn" onClick={() => { setTab('rewind'); setIsProfileOpen(false); }}>
                  <Sparkles size={13} />
                  <span>Monthly Rewinds</span>
                </button>
                <button className="lb-menu-btn" onClick={() => { setTab('analytics'); setIsProfileOpen(false); }}>
                  <BarChart2 size={13} />
                  <span>Viewing Analytics</span>
                </button>
                <button className="lb-menu-btn" onClick={() => { onOpenUpload(); setIsProfileOpen(false); }}>
                  <Upload size={13} />
                  <span>Sync Supabase Data</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary View Links */}
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                className={`lb-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setTab(link.id)}
              >
                {Icon && <Icon size={12} style={{ marginRight: '4px' }} />}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Search & Actions */}
        <div className="lb-right-actions">
          {/* Live Search Bar with TMDb Autocomplete */}
          <div className="lb-search-wrapper" ref={searchDropdownRef}>
            <Search size={14} className="lb-search-icon" />
            <input
              type="text"
              placeholder="Search films..."
              className="lb-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setIsSearchOpen(true)}
            />

            {/* Dropdown Results */}
            {isSearchOpen && (
              <div className="lb-search-dropdown">
                {isSearching ? (
                  <div className="lb-search-empty">Searching TMDb...</div>
                ) : searchResults.length === 0 ? (
                  <div className="lb-search-empty">No films found for "{searchQuery}"</div>
                ) : (
                  searchResults.map(movie => (
                    <div
                      key={movie.id}
                      className="lb-search-result-item"
                      onClick={() => {
                        onSelectMovie({
                          name: movie.title,
                          year: movie.year,
                          poster: movie.posterUrl,
                          rating: movie.rating ? movie.rating / 2 : 4.0,
                          overview: movie.overview,
                          director: ''
                        });
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img
                        src={movie.posterUrl || 'https://via.placeholder.com/92x138/181818/666666?text=No+Poster'}
                        alt={movie.title}
                        className="lb-result-thumb"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lb-result-title">{movie.title}</div>
                        <div className="lb-result-meta">
                          <span>{movie.year || 'N/A'}</span>
                          {movie.rating > 0 && (
                            <>
                              <span>•</span>
                              <span style={{ color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Star size={10} fill="currentColor" /> {movie.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sync Button */}
          <button className="lb-sync-btn" onClick={onOpenUpload} title="Sync Supabase or Import Letterboxd CSVs">
            <Upload size={12} />
            <span>Sync</span>
          </button>

          {/* + LOG Button (Letterboxd signature green/accent button) */}
          <button className="lb-log-btn" onClick={() => onOpenQuickLog(null)}>
            <Plus size={13} strokeWidth={3} />
            <span>LOG</span>
          </button>
        </div>
      </div>
    </header>
  );
}
