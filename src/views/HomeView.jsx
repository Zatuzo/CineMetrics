// src/views/HomeView.jsx
import React, { useState, useEffect } from 'react';
import HeroPersona from '../components/HeroPersona';
import MovieCard from '../components/MovieCard';
import PosterImage from '../components/PosterImage';
import { calculateCinematicPersona } from '../data/personas';
import { buildCinemaMixes, populateMixDiscoveries } from '../services/mixEngine';
import { ChevronRight } from 'lucide-react';

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

  // Filter out fake "Auteur" or unknown director entries
  const dirCounts = {};
  diary.forEach(f => {
    if (f.director && f.director !== 'Unknown Director' && f.director !== 'Auteur' && f.director !== 'Unknown') {
      const dirs = f.director.split(',').map(d => d.trim());
      dirs.forEach(d => {
        if (d && d !== 'Auteur' && d !== 'Unknown Director') {
          dirCounts[d] = (dirCounts[d] || 0) + 1;
        }
      });
    }
  });

  const sortedDirectors = Object.keys(dirCounts).sort((a, b) => dirCounts[b] - dirCounts[a]);
  const topDirector = sortedDirectors[0] || 'Various';

  // Recent logs
  const recentFilms = [...diary].reverse().slice(0, 6);

  // Top Directors list (clean real directors only)
  const topDirectorsList = sortedDirectors.slice(0, 5).map(name => ({
    name,
    count: dirCounts[name]
  }));

  return (
    <div>
      {/* Hero Persona Banner */}
      <HeroPersona
        persona={persona}
        totalHours={totalHours}
        totalFilms={totalFilms}
        meanRating={meanRating}
        topDirector={topDirector}
        monthName="Overall"
      />

      {/* Cinema Mixes Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Cinema Mixes</h2>
            <p className="section-subtitle">Unwatched recommendations and watchlist gems based on your top genres.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('mixes')}
          >
            <span>View all</span>
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

              {/* 4 Poster Thumbnail Strip with PosterImage fallback */}
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

      {/* Recently Logged Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recently Logged</h2>
            <p className="section-subtitle">Latest entries added to your diary.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('rewind')}
          >
            <span>Monthly Rewind</span>
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

      {/* Top Directors In Rotation */}
      {topDirectorsList.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top Directors</h2>
              <p className="section-subtitle">Most logged directors in your watch history.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {topDirectorsList.map((d) => (
              <div
                key={d.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  minWidth: '180px',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                onClick={() => {
                  const firstFilm = diary.find(f => f.director && f.director.includes(d.name));
                  if (firstFilm) onSelectMovie(firstFilm);
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}>
                  {d.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {d.count} films
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
