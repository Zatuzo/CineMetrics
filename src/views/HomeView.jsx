// src/views/HomeView.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  const ratings = diary.filter(f => f.rating || f.Rating).map(f => Number(f.rating || f.Rating));
  const meanRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Recent logs - Sorted STRICTLY descending by date (latest first)
  const recentFilms = useMemo(() => {
    return [...diary]
      .sort((a, b) => {
        const dateA = new Date(a.date || a.Watched_Date || a.Date || 0);
        const dateB = new Date(b.date || b.Watched_Date || b.Date || 0);
        return dateB - dateA;
      })
      .slice(0, 8);
  }, [diary]);

  // 5-Star Masterpieces - Strictly 5.0 stars only
  const topRatedFilms = useMemo(() => {
    return diary.filter(f => Number(f.rating || f.Rating) === 5).slice(0, 8);
  }, [diary]);

  const fiveStarCount = useMemo(() => {
    return diary.filter(f => Number(f.rating || f.Rating) === 5).length;
  }, [diary]);

  // Watchlist Queue (top unwatched)
  const watchlistQueue = useMemo(() => {
    return (watchlist || []).slice(0, 8);
  }, [watchlist]);

  const topMix1 = mixes[0];
  const topMix2 = mixes[1];

  return (
    <div>
      {/* 1. Quick Access 6-Grid */}
      <div className="quick-grid">
        <div className="quick-tile" onClick={() => onNavigate('rewind')}>
          <div className="quick-tile-icon" style={{ background: 'var(--accent-ruby-subtle)', color: 'var(--accent-ruby)' }}>
            <Sparkles size={24} />
          </div>
          <span className="quick-tile-text">Monthly Rewind</span>
        </div>

        <div className="quick-tile" onClick={() => onNavigate('semantic')}>
          <div className="quick-tile-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Compass size={24} />
          </div>
          <span className="quick-tile-text">Vibe Search</span>
        </div>

        {topMix1 && (
          <div className="quick-tile" onClick={() => { onSelectMix(topMix1); onNavigate('mixes'); }}>
            <div className="quick-tile-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Disc3 size={24} />
            </div>
            <span className="quick-tile-text">{topMix1.title}</span>
          </div>
        )}

        {topMix2 && (
          <div className="quick-tile" onClick={() => { onSelectMix(topMix2); onNavigate('mixes'); }}>
            <div className="quick-tile-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Disc3 size={24} />
            </div>
            <span className="quick-tile-text">{topMix2.title}</span>
          </div>
        )}

        <div className="quick-tile" onClick={() => onNavigate('semantic')}>
          <div className="quick-tile-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Bookmark size={24} />
          </div>
          <span className="quick-tile-text">Watchlist ({watchlist.length})</span>
        </div>

        <div className="quick-tile" onClick={() => onNavigate('analytics')}>
          <div className="quick-tile-icon" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--accent-gold)' }}>
            <Star size={24} fill="currentColor" />
          </div>
          <span className="quick-tile-text">Masterpieces ({fiveStarCount})</span>
        </div>
      </div>

      {/* 2. Recently Logged Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recently Logged</h2>
            <p className="section-subtitle">Latest screenings from your Letterboxd diary.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('rewind')}
          >
            <span>Rewind</span>
            <ChevronRight size={14} />
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
            <ChevronRight size={14} />
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

      {/* 4. Watchlist Queue */}
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
              <ChevronRight size={14} />
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

      {/* 5. 5-Star Masterpieces */}
      {topRatedFilms.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">5-Star Masterpieces</h2>
              <p className="section-subtitle">Films awarded a perfect ★ 5.0 rating in your diary.</p>
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
        background: '#141a24',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-ruby-subtle)',
            color: 'var(--accent-ruby)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-ruby)' }}>
              Cinematic Profile
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              {persona}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '28px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Watch Time</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--accent-ruby)' }}>{totalHours.toFixed(1)} hrs</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Diary</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)' }}>{totalFilms} films</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Avg Rating</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--accent-gold)' }}>★ {meanRating ? meanRating.toFixed(2) : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
