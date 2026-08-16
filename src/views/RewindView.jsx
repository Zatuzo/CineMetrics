// src/views/RewindView.jsx
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Download, Clock, Star, Calendar, Film, Trophy } from 'lucide-react';
import { calculateCinematicPersona } from '../data/personas';
import { generateStoryCardBlob } from '../services/storyCard';
import MovieCard from '../components/MovieCard';

export default function RewindView({ diary, onSelectMovie }) {
  // Extract distinct valid months
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

      // Trigger Confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Download PNG
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cinemetrics_${selectedMonth}_story.png`;
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
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>📼 Monthly Wrapped Retrospective</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            A Spotify Wrapped–style breakdown of your cinema diary and viewing velocity.
          </p>
        </div>

        {/* Month Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {months.map(m => (
            <button
              key={m}
              className={selectedMonth === m ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 14px' }}
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {monthFilms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px' }}>
          <Film size={40} color="#64748b" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#f8fafc' }}>No films logged for {selectedMonth}</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Log films or sync your Letterboxd diary to view monthly rewinds.
          </p>
        </div>
      ) : (
        <>
          {/* Persona Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #38bdf8',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  background: '#38bdf8',
                  color: '#07090e',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontWeight: '800',
                  fontSize: '11px',
                  textTransform: 'uppercase'
                }}>
                  MONTHLY CINEMATIC PERSONA
                </span>
                <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#f59e0b', marginTop: '10px', marginBottom: '6px' }}>
                  ✨ {persona}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Your dominant taste & viewing signature for <b>{selectedMonth}</b>.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleExportStory}
                disabled={isExporting}
              >
                <Download size={16} />
                <span>{isExporting ? 'Rendering Card...' : 'Export 9:16 Story Card'}</span>
              </button>
            </div>

            {/* KPI Grid */}
            <div className="hero-kpis" style={{ marginTop: '24px' }}>
              <div className="kpi-tile">
                <div className="kpi-label">⏱️ Watch Time</div>
                <div className="kpi-value" style={{ color: '#38bdf8' }}>{totalHours.toFixed(1)} hrs</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">🍿 Films Logged</div>
                <div className="kpi-value" style={{ color: '#10b981' }}>{totalFilms} films</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">★ Mean Rating</div>
                <div className="kpi-value" style={{ color: '#f59e0b' }}>{meanRating ? `★ ${meanRating.toFixed(2)}` : 'N/A'}</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">📅 Peak Rhythm</div>
                <div className="kpi-value" style={{ color: '#a855f7' }}>{peakDay}</div>
              </div>
            </div>
          </div>

          {/* Top Films Podium */}
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">👑 Top Films of {selectedMonth}</h2>
                <p className="section-subtitle">Your highest-rated watches in this monthly capsule.</p>
              </div>
            </div>

            <div className="media-rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {topFilms.map((film, idx) => {
                const medals = ['🥇 #1 Gold', '🥈 #2 Silver', '🥉 #3 Bronze'];
                return (
                  <MovieCard
                    key={film.id}
                    movie={film}
                    onSelect={onSelectMovie}
                    badge={medals[idx]}
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
