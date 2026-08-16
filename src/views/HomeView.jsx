// src/views/HomeView.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import PosterImage from '../components/PosterImage';
import { calculateCinematicPersona } from '../data/personas';
import { buildCinemaMixes, populateMixDiscoveries } from '../services/mixEngine';
import { ChevronRight, Star, Bookmark, Disc3, Sparkles, Compass } from 'lucide-react';

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

  // 5-Star / Top Rated Masterpieces
  const topRatedFilms = diary.filter(f => f.rating && f.rating >= 4.5).slice(0, 6);

  // Watchlist Queue (top unwatched)
  const watchlistQueue = (watchlist || []).slice(0, 6);

  const topMix1 = mixes[0];
  const topMix2 = mixes[1];

  return (
    <div>
      {/* 1. Spotify-Style Quick Access 6-Grid */}
      <div className="quick-grid">
        <div className="quick-tile" onClick={() => onNavigate('rewind')}>
          <div className="quick-tile-icon" style={{ background: 'var(--accent-red-subtle)', color: 'var(--accent-red)' }}>
            <Sparkles size={20} />
          </div>
          <span className="quick-tile-text">Monthly Rewind</span>
        </div>

        <div className="quick-tile" onClick={() => onNavigate('semantic')}>
          <div className="quick-tile-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Compass size={20} />
          </div>
          <span className="quick-tile-text">Vibe Search</span>
        </div>

        {topMix1 && (
          <div className="quick-tile" onClick={() => { onSelectMix(topMix1); onNavigate('mixes'); }}>
            <div className="quick-tile-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--accent-gold)' }}>
              <Disc3 size={20} />
            </div>
            <span className="quick-tile-text">{topMix1.title}</span>
          </div>
        )}

        {topMix2 && (
          <div className="quick-tile" onClick={() => { onSelectMix(topMix2); onNavigate('mixes'); }}>
            <div className="quick-tile-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Disc3 size={20} />
            </div>
            <span className="quick-tile-text">{topMix2.title}</span>
          </div>
        )}

        <div className="quick-tile" onClick={() => onNavigate('semantic')}>
          <div className="quick-tile-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Bookmark size={20} />
          </div>
          <span className="quick-tile-text">Watchlist ({watchlist.length})</span>
        </div>

        <div className="quick-tile" onClick={() => onNavigate('analytics')}>
          <div className="quick-tile-icon" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--accent-gold)' }}>
            <Star size={20} fill="currentColor" />
          </div>
          <span className="quick-tile-text">Masterpieces ({topRatedFilms.length})</span>
        </div>
      </div>

      {/* 2. Recently Logged Rail */}
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

      {/* 3. Cinema Mixes Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Your Cinema Mixes</h2>
            <p className="section-subtitle">Unwatched discoveries tailored to your favorite genres.</p>
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

      {/* 4. Watchlist Queue (If watchlist has items) */}
      {watchlistQueue.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">From Your Watchlist</h2>
              <p className="section-subtitle">Unwatched gems queued for your next screening.</p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('semantic')}
            >
              <span>Vibe Search</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="media-rail">
            {watchlistQueue.map(film => (
              <MovieCard
                key={film.id}
                movie={film}
                onSelect={onSelectMovie}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. 5-Star Masterpieces (Highest rated films) */}
      {topRatedFilms.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">5-Star Masterpieces</h2>
              <p className="section-subtitle">Your highest-rated films in the diary.</p>
            </div>
          </div>

          <div className="media-rail">
            {topRatedFilms.map(film => (
              <MovieCard
                key={film.id}
                movie={film}
                onSelect={onSelectMovie}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Persona Summary Footer Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '12px'
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
