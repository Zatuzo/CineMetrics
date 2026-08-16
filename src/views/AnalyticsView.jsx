// src/views/AnalyticsView.jsx
import React from 'react';
import { BarChart3, Calendar, Film, Star, Trophy } from 'lucide-react';
import { DAY_ORDER } from '../config';

export default function AnalyticsView({ diary }) {
  if (diary.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
        <BarChart3 size={36} color="#e11d48" style={{ marginBottom: '10px' }} />
        <h3 style={{ fontSize: '16px', color: '#fff1f2' }}>No screening data available</h3>
        <p style={{ color: '#fda4af', fontSize: '13px', marginTop: '4px' }}>
          Log screenings or upload your Letterboxd diary to generate ledger analytics.
        </p>
      </div>
    );
  }

  // Decades Breakdown
  const decadeCounts = {};
  diary.forEach(f => {
    if (f.decade && f.decade !== 'N/A' && f.decade !== 'NaNs') {
      decadeCounts[f.decade] = (decadeCounts[f.decade] || 0) + 1;
    }
  });
  const decadesSorted = Object.keys(decadeCounts).sort();
  const maxDecadeVal = Math.max(...Object.values(decadeCounts), 1);

  // Day of Week Distribution
  const dayCounts = {};
  DAY_ORDER.forEach(d => { dayCounts[d] = 0; });
  diary.forEach(f => {
    if (f.dayOfWeek && dayCounts[f.dayOfWeek] !== undefined) {
      dayCounts[f.dayOfWeek] += 1;
    }
  });
  const maxDayVal = Math.max(...Object.values(dayCounts), 1);

  // Top Directors
  const dirMap = {};
  diary.forEach(f => {
    if (f.director && f.director !== 'Unknown Director') {
      const dirs = f.director.split(',').map(d => d.trim());
      dirs.forEach(d => {
        if (!dirMap[d]) dirMap[d] = { count: 0, totalRating: 0, ratingCount: 0 };
        dirMap[d].count += 1;
        if (f.rating) {
          dirMap[d].totalRating += f.rating;
          dirMap[d].ratingCount += 1;
        }
      });
    }
  });

  const topDirectors = Object.keys(dirMap)
    .map(name => ({
      name,
      count: dirMap[name].count,
      avgRating: dirMap[name].ratingCount > 0 ? dirMap[name].totalRating / dirMap[name].ratingCount : null
    }))
    .sort((a, b) => b.count - a.count || (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 6);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>📊 Theatre Ledger & Statistics</h1>
        <p style={{ color: '#fda4af', fontSize: '13px' }}>
          Historical screening distribution spanning decades, days of the week, and top auteur rotations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Decades Distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Film size={16} color="#e11d48" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Decade Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {decadesSorted.map(decade => {
              const count = decadeCounts[decade];
              const pct = (count / maxDecadeVal) * 100;
              return (
                <div key={decade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fda4af', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '600', color: '#fff1f2' }}>{decade}</span>
                    <span>{count} screenings</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #be123c 0%, #e11d48 100%)', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-of-Week Rhythm */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Calendar size={16} color="#fbbf24" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Weekly Screening Rhythm</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DAY_ORDER.map(day => {
              const count = dayCounts[day] || 0;
              const pct = (count / maxDayVal) * 100;
              return (
                <div key={day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fda4af', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '600', color: '#fff1f2' }}>{day}</span>
                    <span>{count} logged</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Directors Matrix */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Trophy size={16} color="#fbbf24" />
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Top Auteurs in the Repertoire</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {topDirectors.map((d, idx) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(225, 29, 72, 0.04)',
                border: '1px solid rgba(225, 29, 72, 0.15)'
              }}
            >
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: '700', color: '#fff1f2' }}>
                  #{idx + 1} {d.name}
                </div>
                <div style={{ fontSize: '11px', color: '#fda4af', marginTop: '2px' }}>
                  {d.count} screenings in diary
                </div>
              </div>

              {d.avgRating && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  ★ {d.avgRating.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
