// src/views/HomeView.jsx
import React from 'react';
import HeroPersona from '../components/HeroPersona';
import MovieCard from '../components/MovieCard';
import { calculateCinematicPersona } from '../data/personas';
import { buildCinemaMixes } from '../services/mixEngine';
import { ChevronRight, Disc3, Sparkles, Film, User } from 'lucide-react';

export default function HomeView({ diary, onSelectMovie, onSelectMix, onNavigate }) {
  const persona = calculateCinematicPersona(diary);
  const mixes = buildCinemaMixes(diary, 4);

  // Compute stats
  const totalFilms = diary.length;
  const totalMins = diary.reduce((acc, f) => acc + (f.runtime || 110), 0);
  const totalHours = totalMins / 60;
  const ratings = diary.filter(f => f.rating).map(f => f.rating);
  const meanRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Compute top director
  const dirCounts = {};
  diary.forEach(f => {
    if (f.director && f.director !== 'Unknown Director') {
      const dirs = f.director.split(',').map(d => d.trim());
      dirs.forEach(d => { dirCounts[d] = (dirCounts[d] || 0) + 1; });
    }
  });
  const topDirector = Object.keys(dirCounts).sort((a, b) => dirCounts[b] - dirCounts[a])[0] || 'Auteur Variety';

  // Recent logs
  const recentFilms = [...diary].reverse().slice(0, 6);

  // Top Auteurs list
  const topAuteurs = Object.keys(dirCounts)
    .sort((a, b) => dirCounts[b] - dirCounts[a])
    .slice(0, 5)
    .map(name => ({
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
        monthName="Taste Profile"
      />

      {/* Daily Mixes Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">🎧 Your Cinema Daily Mixes</h2>
            <p className="section-subtitle">Algorithmic film blends personalized to your highest-rated genres.</p>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => onNavigate('mixes')}
          >
            <span>See All Mixes</span>
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
              <div className="mix-card-top-bar" style={{ background: mix.color }} />
              <div className="mix-card-title">{mix.title}</div>
              <div className="mix-card-desc">{mix.description}</div>

              {/* 4 Poster Thumbnail Strip */}
              <div className="mix-poster-strip">
                {mix.films.map(film => (
                  <img
                    key={film.id}
                    src={film.poster || 'https://via.placeholder.com/60x90/182234/94a3b8?text=Poster'}
                    alt={film.name}
                    className="mix-thumb"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Logged Film Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">🍿 Recent Diary Entries</h2>
            <p className="section-subtitle">Your latest logged screenings, ratings, and thoughts.</p>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => onNavigate('rewind')}
          >
            <span>Monthly Wrapped</span>
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

      {/* Top Auteur Stations (Spotify Artist Circles) */}
      {topAuteurs.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">🏆 Top Auteurs in Rotation</h2>
              <p className="section-subtitle">The directors dominating your viewing sessions.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '10px' }}>
            {topAuteurs.map((auteur, idx) => (
              <div
                key={auteur.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '130px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
                onClick={() => {
                  const firstFilm = diary.find(f => f.director && f.director.includes(auteur.name));
                  if (firstFilm) onSelectMovie(firstFilm);
                }}
              >
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${['#38bdf8', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'][idx % 5]} 0%, #0f172a 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#ffffff',
                  marginBottom: '10px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
                }}>
                  {auteur.name.charAt(0)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                  {auteur.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {auteur.count} films logged
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
