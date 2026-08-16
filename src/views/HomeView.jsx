// src/views/HomeView.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import PosterImage from '../components/PosterImage';
import { calculateCinematicPersona } from '../data/personas';
import { buildCinemaMixes, populateMixDiscoveries } from '../services/mixEngine';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function HomeView({ diary, watchlist, onSelectMovie, onSelectMix, onNavigate }) {
  const persona = calculateCinematicPersona(diary);
  const [mixes, setMixes] = useState(() => buildCinemaMixes(diary, watchlist, 4));

  useEffect(() => {
    const base = buildCinemaMixes(diary, watchlist, 4);
    setMixes(base);
    populateMixDiscoveries(base, diary).then(enriched => {
      setMixes(enriched);
    });
  }, [diary, watchlist]);

  // Stats
  const totalFilms = diary.length;
  const totalMins = diary.reduce((acc, f) => acc + (f.runtime || 110), 0);
  const totalHours = totalMins / 60;
  const ratings = diary.filter(f => f.rating).map(f => f.rating);
  const meanRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Recent logs
  const recentFilms = [...diary].reverse().slice(0, 6);

  return (
    <div>
      {/* 1. Recently Logged (Movies First!) */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recently Logged</h2>
            <p className="section-subtitle">Latest entries in your diary.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('rewind')}
          >
            <span>Rewind</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="media-rail">
          {recentFilms.map(film => (
            <MovieCard
              key={film.id}
              movie={film}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      </div>

      {/* 2. Cinema Mixes */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Cinema Mixes</h2>
            <p className="section-subtitle">Unwatched recommendations based on your favorite genres.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('mixes')}
          >
            <span>All Mixes</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="mix-grid">
          {mixes.map(mix => (
            <div
              key={mix.id}
              className="mix-card"
              onClick={() => onSelectMix(mix)}
            >
              <div className="mix-card-top-bar" />
              <div className="mix-card-title">{mix.title}</div>
              <div className="mix-card-desc">{mix.description}</div>

              {/* 4 Poster Thumbnail Strip */}
              <div className="mix-poster-strip">
                {mix.films.slice(0, 4).map((film, idx) => (
                  <div key={film.id || idx} style={{ width: '100%', aspectRatio: '2/3' }}>
                    <PosterImage
                      src={film.poster}
                      name={film.name}
                      year={film.year}
                      className="mix-thumb"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sleek Compact Persona Profile (Neatly placed below movies) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-red-subtle)',
            color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-red)' }}>
              Cinematic Profile
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {persona}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Watch Time</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-red)' }}>{totalHours.toFixed(1)} hrs</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diary</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{totalFilms} films</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Rating</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-gold)' }}>★ {meanRating ? meanRating.toFixed(2) : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
