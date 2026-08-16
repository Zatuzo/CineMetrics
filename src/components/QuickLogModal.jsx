// src/components/QuickLogModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, Star, Ticket, Check } from 'lucide-react';
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
    }, 280);

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
      director: selectedMovie.director || 'TMDb Auteur',
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
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>🎟️ Log Theater Screening</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fda4af', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TMDb Search step if no movie is selected */}
        {!selectedMovie ? (
          <div>
            <div className="form-group">
              <label className="form-label">Search Film Title</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9f7580' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Type title (e.g. Inception, Dune, Taxi Driver...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {isSearching ? (
                <div style={{ textAlign: 'center', color: '#fda4af', padding: '20px' }}>Searching marquee...</div>
              ) : (
                results.map(m => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'rgba(225, 29, 72, 0.04)',
                      border: '1px solid rgba(225, 29, 72, 0.1)',
                      marginBottom: '8px'
                    }}
                    onClick={() => setSelectedMovie(m)}
                  >
                    <img
                      src={m.posterUrl || 'https://via.placeholder.com/60x90/17090d/fda4af?text=Poster'}
                      alt={m.title}
                      style={{ width: '38px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: '700', fontSize: '14px', color: '#fff1f2' }}>{m.title}</div>
                      <div style={{ fontSize: '12px', color: '#fda4af' }}>{m.year} • ★ {m.rating}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Selected movie header */}
            <div style={{ display: 'flex', gap: '14px', background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '18px' }}>
              <img
                src={selectedMovie.posterUrl || selectedMovie.poster || 'https://via.placeholder.com/90x135'}
                alt={selectedMovie.title || selectedMovie.name}
                style={{ width: '54px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800' }}>{selectedMovie.title || selectedMovie.name}</h3>
                <div style={{ fontSize: '12px', color: '#fda4af', marginTop: '2px' }}>
                  {selectedMovie.year} • {selectedMovie.director || 'Auteur'}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  style={{ background: 'transparent', border: 'none', color: '#e11d48', fontSize: '12px', cursor: 'pointer', marginTop: '6px', padding: 0 }}
                >
                  Change Film
                </button>
              </div>
            </div>

            {/* Rating Slider & Stars */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Rating</label>
                <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '15px' }}>
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
                style={{ width: '100%', accentColor: '#e11d48' }}
              />
            </div>

            {/* Watch Date */}
            <div className="form-group">
              <label className="form-label">Screening Date</label>
              <input
                type="date"
                className="form-input"
                value={watchDate}
                onChange={(e) => setWatchDate(e.target.value)}
              />
            </div>

            {/* Review notes */}
            <div className="form-group">
              <label className="form-label">Screening Notes & Reflections</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Auteur direction, cinematography, pacing..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {savedSuccess ? <Check size={15} /> : <Ticket size={15} />}
                <span>{savedSuccess ? 'Screening Logged!' : 'Save Screening'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
