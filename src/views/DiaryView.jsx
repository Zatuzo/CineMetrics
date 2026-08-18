// src/views/DiaryView.jsx
import React, { useState, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { Calendar, Filter, Film, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseDateInfo(dateStr) {
  if (!dateStr || dateStr.length < 10) {
    return { month: 'LOG', day: '--', fullDate: 'Undated screening', dayOfWeek: '' };
  }
  try {
    const parts = dateStr.slice(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dt = new Date(Date.UTC(year, monthIdx, day, 12, 0, 0));

    const monthAbbr = MONTH_NAMES[monthIdx] || 'LOG';
    const dayOfWeek = DAYS[dt.getUTCDay()] || '';
    const fullDate = dt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });

    return { month: monthAbbr, day: String(day), fullDate, dayOfWeek, year };
  } catch {
    return { month: 'LOG', day: '--', fullDate: dateStr, dayOfWeek: '' };
  }
}

function formatMonthLabel(monthStr) {
  if (!monthStr || monthStr.length < 7) return monthStr;
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DiaryView({ diary = [], onSelectMovie }) {
  // 1. Extract all available months (YYYY-MM)
  const availableMonths = useMemo(() => {
    const set = new Set();
    diary.forEach(f => {
      const d = f.date || f.Watched_Date || f.Date;
      if (d && typeof d === 'string' && d.length >= 7) {
        set.add(d.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [diary]);

  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // 2. Filter diary by selected month
  const filteredFilms = useMemo(() => {
    let list = [...diary].sort((a, b) => {
      const dateA = new Date(a.date || a.Watched_Date || a.Date || 0);
      const dateB = new Date(b.date || b.Watched_Date || b.Date || 0);
      return dateB - dateA;
    });

    if (selectedMonth !== 'ALL') {
      list = list.filter(f => {
        const d = f.date || f.Watched_Date || f.Date;
        return d && typeof d === 'string' && d.startsWith(selectedMonth);
      });
    }

    return list;
  }, [diary, selectedMonth]);

  // 3. Group by unique date (Skipping dates with no entries)
  const dateGroups = useMemo(() => {
    const groups = {};
    filteredFilms.forEach(film => {
      const dateStr = film.date || film.Watched_Date || film.Date;
      const key = dateStr && typeof dateStr === 'string' && dateStr.length >= 10 
        ? dateStr.slice(0, 10) 
        : 'Undated';

      if (!groups[key]) groups[key] = [];
      groups[key].push(film);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(key => ({
        dateKey: key,
        dateInfo: parseDateInfo(key),
        films: groups[key]
      }));
  }, [filteredFilms]);

  const totalEntries = filteredFilms.length;
  const uniqueDatesCount = dateGroups.length;

  return (
    <div className="diary-view-container">
      {/* Header with Month Selector Filter */}
      <div className="diary-header-bar">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>Film Diary</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Visual chronological log of your screenings grouped by date watched.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: '#141a24',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0 14px',
            height: '42px'
          }}>
            <Calendar size={16} style={{ color: 'var(--accent-ruby)', flexShrink: 0 }} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '4px 0',
                margin: 0
              }}
            >
              <option value="ALL" style={{ background: '#141a24', color: '#ffffff' }}>
                All Months ({diary.length} films)
              </option>
              {availableMonths.map(m => {
                const count = diary.filter(f => {
                  const d = f.date || f.Watched_Date || f.Date;
                  return d && typeof d === 'string' && d.startsWith(m);
                }).length;
                return (
                  <option key={m} value={m} style={{ background: '#141a24', color: '#ffffff' }}>
                    {formatMonthLabel(m)} ({count} {count === 1 ? 'film' : 'films'})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{
            background: 'rgba(255, 51, 102, 0.1)',
            border: '1px solid rgba(255, 51, 102, 0.25)',
            color: 'var(--accent-ruby)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            {totalEntries} Films across {uniqueDatesCount} Days
          </div>
        </div>
      </div>

      {/* Date-Grouped Visual Feed */}
      {dateGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#141a24', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Film size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>No diary entries found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Try selecting "All Months" or log a new film using the + LOG FILM button.
          </p>
        </div>
      ) : (
        <div className="diary-timeline">
          {dateGroups.map(group => {
            const { dateKey, dateInfo, films } = group;

            return (
              <section key={dateKey} className="diary-date-section">
                {/* Date Header Ribbon */}
                <div className="diary-date-ribbon">
                  <div className="diary-calendar-badge">
                    <span className="cal-month">{dateInfo.month}</span>
                    <span className="cal-day">{dateInfo.day}</span>
                  </div>

                  <div className="diary-date-info">
                    <div className="diary-date-title">
                      {dateInfo.fullDate}
                    </div>
                    <div className="diary-date-sub">
                      {dateInfo.dayOfWeek && <span className="diary-day-pill">{dateInfo.dayOfWeek}</span>}
                      <span>{films.length} {films.length === 1 ? 'screening' : 'screenings'}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Poster Cards Grid for this Date */}
                <div className="diary-posters-grid">
                  {films.map(film => (
                    <MovieCard
                      key={film.id || `${film.name}-${dateKey}`}
                      movie={film}
                      onSelect={onSelectMovie}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
