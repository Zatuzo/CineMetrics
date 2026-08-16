// src/views/HomeView.jsx
import React from 'react';
import HeroPersona from '../components/HeroPersona';
import MovieCard from '../components/MovieCard';
import { calculateCinematicPersona } from '../data/personas';
import { buildCinemaMixes } from '../services/mixEngine';
import { ChevronRight, Film } from 'lucide-react';

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
  const topDirector = Object.keys(dirCounts).sort((a, b) => dirCounts[b] - dirCounts[a])[0] || 'Various Auteurs';

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
        monthName="Current Repertoire"
      />

      {/* Curated Double Features / Daily Mixes Rail */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">🎬 Curated Double Features & Programmes</h2>
            <p className="section-subtitle">Algorithmic cinema reels tailored to your highest-rated genres.</p>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => onNavigate('mixes')}
          >
            <span>All Programmes</span>
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
              <div className="mix-card-top-bar" style={{ background: '#e11d48' }} />
              <div className="mix-card-title">{mix.title}</div>
              <div className="mix-card-desc">{mix.description}</div>

              {/* 4 Poster Thumbnail Strip */}
              <div className="mix-poster-strip">
                {mix.films.map(film => (
                  <img
                    key={film.id}
                    src={film.poster || 'https://via.placeholder.com/60x90/17090d/fda4af?text=Poster'}
                    alt={film.name}
                    className="mix-thumb"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Screenings Reel */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">🎟️ Recent Screenings from the Diary</h2>
            <p className="section-subtitle">Your latest logged screenings, reflections, and star ratings.</p>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => onNavigate('rewind')}
          >
            <span>Monthly Reel</span>
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

      {/* Top Auteurs in Rotation */}
      {topAuteurs.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">🏆 Auteurs in the Auditorium Rotation</h2>
              <p className="section-subtitle">Directors with the highest volume in your screenings.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
            {topAuteurs.map((auteur) => (
              <div
                key={auteur.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '130px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#e11d48';
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
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#ffffff',
                  marginBottom: '10px',
                  boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  {auteur.name.charAt(0)}
                </div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: '700', color: '#fff1f2', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                  {auteur.name}
                </div>
                <div style={{ fontSize: '11px', color: '#fda4af', marginTop: '2px' }}>
                  {auteur.count} screenings
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
