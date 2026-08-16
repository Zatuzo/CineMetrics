// src/components/QuickLogModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { searchTMDbMovies } from '../services/tmdb';

export default function QuickLogModal({ initialMovie = null, isOpen, onClose, onSaveFilm }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(initialMovie);
  const [rating, setRating] = useState(4.0);
  const [review, setReview] = useState('');
  const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialMovie) {
      setSelectedMovie(initialMovie);
      setRating(initialMovie.rating || 4.0);
      setReview(initialMovie.review || '');
    }
  }, [initialMovie]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchTMDbMovies(query);
      setResults(res);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMovie) return;

    const d = new Date(watchDate);
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    const decade = selectedMovie.year ? `${Math.floor(parseInt(selectedMovie.year) / 10) * 10}s` : '2020s';

    onSaveFilm({
      id: Date.now(),
      name: selectedMovie.title || selectedMovie.name,
      year: parseInt(selectedMovie.year) || 2024,
      date: watchDate,
      monthYear,
      dayOfWeek,
      rating: parseFloat(rating),
      director: selectedMovie.director || 'Director',
      genre: selectedMovie.genre || 'Cinema',
      overview: selectedMovie.overview || '',
      poster: selectedMovie.posterUrl || selectedMovie.poster || null,
      runtime: selectedMovie.runtime || 115,
      decade,
      review
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Log Film</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* TMDb Search step if no movie is selected */}
        {!selectedMovie ? (
          <div>
            <div className="form-group">
              <label className="form-label">Search Film Title</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="e.g. Inception, Dune, Past Lives..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {isSearching ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px', fontSize: '12px' }}>Searching...</div>
              ) : (
                results.map(m => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '6px'
                    }}
                    onClick={() => setSelectedMovie(m)}
                  >
                    <img
                      src={m.posterUrl || 'https://via.placeholder.com/60x90/181818/666666?text=Poster'}
                      alt={m.title}
                      style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{m.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.year} • ★ {m.rating}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Selected movie header */}
            <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <img
                src={selectedMovie.posterUrl || selectedMovie.poster || 'https://via.placeholder.com/90x135'}
                alt={selectedMovie.title || selectedMovie.name}
                style={{ width: '44px', height: '64px', objectFit: 'cover', borderRadius: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{selectedMovie.title || selectedMovie.name}</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedMovie.year} • {selectedMovie.director || 'Director'}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', fontSize: '11px', cursor: 'pointer', marginTop: '4px', padding: 0 }}
                >
                  Change
                </button>
              </div>
            </div>

            {/* Rating Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Rating</label>
                <div style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '13px' }}>
                  ★ {Number(rating).toFixed(1)} / 5.0
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-red)' }}
              />
            </div>

            {/* Watch Date */}
            <div className="form-group">
              <label className="form-label">Watched Date</label>
              <input
                type="date"
                className="form-input"
                value={watchDate}
                onChange={(e) => setWatchDate(e.target.value)}
              />
            </div>

            {/* Review notes */}
            <div className="form-group">
              <label className="form-label">Notes / Review (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Thoughts on direction, pacing, cinematography..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {savedSuccess ? <Check size={14} /> : <Plus size={14} />}
                <span>{savedSuccess ? 'Logged' : 'Save'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
