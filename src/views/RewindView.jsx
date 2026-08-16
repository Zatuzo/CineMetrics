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
  const topDirector = Object.keys(dirCounts).sort((a, b) => dirCounts[b] - dirCounts[a])[0] || 'Various';

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
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cinemetrics_${selectedMonth}_rewind.png`;
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
      {/* Header & Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Monthly Rewind</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Retrospective breakdown of your viewing diary and top films.
          </p>
        </div>

        {/* Month Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {months.map(m => (
            <button
              key={m}
              className={selectedMonth === m ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '5px 10px' }}
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {monthFilms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <Film size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>No films logged for {selectedMonth}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Upload your Letterboxd export or log entries to view monthly statistics.
          </p>
        </div>
      ) : (
        <>
          {/* Persona Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '22px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="hero-tag">
                  {selectedMonth} REWIND
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', marginBottom: '2px' }}>
                  {persona}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Your primary viewing character for <b>{selectedMonth}</b>.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleExportStory}
                disabled={isExporting}
              >
                <Download size={13} />
                <span>{isExporting ? 'Rendering...' : 'Download Story Card (PNG)'}</span>
              </button>
            </div>

            {/* KPI Grid */}
            <div className="hero-kpis" style={{ marginTop: '16px' }}>
              <div className="kpi-tile">
                <div className="kpi-label">Watch Time</div>
                <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>{totalHours.toFixed(1)} hrs</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">Films Logged</div>
                <div className="kpi-value">{totalFilms}</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">Mean Rating</div>
                <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>{meanRating ? `★ ${meanRating.toFixed(2)}` : 'N/A'}</div>
              </div>
              <div className="kpi-tile">
                <div className="kpi-label">Peak Day</div>
                <div className="kpi-value" style={{ fontSize: '15px' }}>{peakDay}</div>
              </div>
            </div>
          </div>

          {/* Top Films */}
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Top Films of {selectedMonth}</h2>
                <p className="section-subtitle">Your highest-rated watches in this period.</p>
              </div>
            </div>

            <div className="media-rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {topFilms.map((film, idx) => {
                const ranks = ['#1 Ranked', '#2 Ranked', '#3 Ranked'];
                return (
                  <MovieCard
                    key={film.id}
                    movie={film}
                    onSelect={onSelectMovie}
                    badge={ranks[idx]}
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
