// src/views/RewindView.jsx
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Film } from 'lucide-react';
import { calculateCinematicPersona } from '../data/personas';
import { generateStoryCardBlob } from '../services/storyCard';
import MovieCard from '../components/MovieCard';

export default function RewindView({ diary, onSelectMovie }) {
  const months = Array.from(
    new Set(diary.map(f => f.monthYear).filter(m => m && m !== 'Undated'))
  ).sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState(months[0] || '2024-03');
  const [isExporting, setIsExporting] = useState(false);

  const monthFilms = diary.filter(f => f.monthYear === selectedMonth);
  const persona = calculateCinematicPersona(monthFilms);

  // Stats
  const totalFilms = monthFilms.length;
  const totalMins = monthFilms.reduce((acc, f) => acc + (f.runtime || 110), 0);
  const totalHours = totalMins / 60;
  const ratings = monthFilms.filter(f => f.rating).map(f => f.rating);
  const meanRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Peak Day
  const dayCounts = {};
  monthFilms.forEach(f => {
    if (f.dayOfWeek && f.dayOfWeek !== 'N/A') {
      dayCounts[f.dayOfWeek] = (dayCounts[f.dayOfWeek] || 0) + 1;
    }
  });
  const peakDay = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a])[0] || 'Saturday';

  // Top Director
  const dirCounts = {};
  monthFilms.forEach(f => {
    if (f.director && f.director !== 'Unknown Director') {
      const dirs = f.director.split(',').map(d => d.trim());
      dirs.forEach(d => { dirCounts[d] = (dirCounts[d] || 0) + 1; });
    }
  });
  const topDirector = Object.keys(dirCounts).sort((a, b) => dirCounts[b] - dirCounts[a])[0] || 'Various Auteurs';

  // Top Genres
  const genreCounts = {};
  monthFilms.forEach(f => {
    if (f.genre) {
      const gList = f.genre.split(',').map(g => g.trim()).filter(g => g && g !== 'Cinema');
      gList.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
    }
  });
  const topGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

  // Top 3 Films
  const topFilms = [...monthFilms].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  const leadPoster = topFilms[0]?.poster || null;

  const handleExportStory = async () => {
    setIsExporting(true);
    try {
      const blob = await generateStoryCardBlob({
        monthYear: selectedMonth,
        persona,
        totalFilms,
        totalHours,
        topDirector,
        topGenres,
        posterUrl: leadPoster
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cinemetrics_${selectedMonth}_reel.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Month Selection Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>🎞️ Monthly Theatre Retrospective Reel</h1>
          <p style={{ color: '#fda4af', fontSize: '13px' }}>
            A curated monthly retrospective of your viewing velocity, marquee highlights, and top auteurs.
          </p>
        </div>

        {/* Month Selector Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {months.map(m => (
            <button
              key={m}
              className={selectedMonth === m ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {monthFilms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <Film size={36} color="#9f7580" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '16px', color: '#fff1f2' }}>No screenings logged for {selectedMonth}</h3>
          <p style={{ color: '#fda4af', fontSize: '13px', marginTop: '4px' }}>
            Log screenings in the box office to view monthly retrospectives.
          </p>
        </div>
      ) : (
        <>
          {/* Persona Reel Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(76, 5, 25, 0.6) 0%, rgba(15, 5, 8, 0.98) 100%)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '16px',
            padding: '26px',
            marginBottom: '32px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  background: 'rgba(225, 29, 72, 0.2)',
                  color: '#fecdd3',
                  border: '1px solid rgba(225, 29, 72, 0.4)',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontWeight: '800',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  MONTHLY AUDITORIUM PROGRAMME
                </span>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '30px', fontWeight: '800', color: '#fbbf24', marginTop: '8px', marginBottom: '4px' }}>
                  🎬 {persona}
                </h2>
                <p style={{ color: '#fda4af', fontSize: '13px' }}>
                  Your signature aesthetic identity for <b>{selectedMonth}</b>.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleExportStory}
                disabled={isExporting}
              >
                <Download size={15} />
                <span>{isExporting ? 'Rendering Reel...' : 'Export 9:16 Story Card'}</span>
              </button>
            </div>

            {/* KPI Grid */}
            <div className="hero-kpis" style={{ marginTop: '20px' }}>
              <div className="kpi-tile">
                <div className="kpi-label">⏱️ Screen Time</div>
                <div className="kpi-value" style={{ color: '#e11d48' }}>{totalHours.toFixed(1)} hrs</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">🍿 Screenings Logged</div>
                <div className="kpi-value" style={{ color: '#fff1f2' }}>{totalFilms} films</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">★ Mean Rating</div>
                <div className="kpi-value" style={{ color: '#fbbf24' }}>{meanRating ? `★ ${meanRating.toFixed(2)}` : 'N/A'}</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">📅 Peak Rhythm</div>
                <div className="kpi-value" style={{ color: '#f43f5e' }}>{peakDay}</div>
              </div>
            </div>
          </div>

          {/* Top Films Podium */}
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">🏆 Top Screenings of {selectedMonth}</h2>
                <p className="section-subtitle">The highest-rated films in this monthly reel.</p>
              </div>
            </div>

            <div className="media-rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {topFilms.map((film, idx) => {
                const awards = ['🥇 Palme d\'Or', '🥈 Grand Prix', '🥉 Jury Prize'];
                return (
                  <MovieCard
                    key={film.id}
                    movie={film}
                    onSelect={onSelectMovie}
                    badge={awards[idx]}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
