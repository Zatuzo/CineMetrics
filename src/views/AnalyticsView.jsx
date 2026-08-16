// src/views/AnalyticsView.jsx
import React from 'react';
import { BarChart2, Calendar, Film, Star } from 'lucide-react';
import { DAY_ORDER } from '../config';

export default function AnalyticsView({ diary }) {
  if (diary.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <BarChart2 size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
        <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>No diary data available</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
          Log entries or upload your Letterboxd export to view analytics.
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

  // Top Directors (Clean real directors only)
  const dirMap = {};
  diary.forEach(f => {
    if (f.director && f.director !== 'Unknown Director' && f.director !== 'Auteur' && f.director !== 'Unknown') {
      const dirs = f.director.split(',').map(d => d.trim());
      dirs.forEach(d => {
        if (d && d !== 'Auteur' && d !== 'Unknown Director') {
          if (!dirMap[d]) dirMap[d] = { count: 0, totalRating: 0, ratingCount: 0 };
          dirMap[d].count += 1;
          if (f.rating) {
            dirMap[d].totalRating += f.rating;
            dirMap[d].ratingCount += 1;
          }
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
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Taste Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Breakdown of your viewing history across decades, weekly rhythms, and directors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Decades Distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Film size={14} color="var(--accent-red)" />
            <h3 style={{ fontSize: '13px', fontWeight: '700' }}>Decade Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {decadesSorted.map(decade => {
              const count = decadeCounts[decade];
              const pct = (count / maxDecadeVal) * 100;
              return (
                <div key={decade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{decade}</span>
                    <span>{count} films</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '2px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-of-Week Rhythm */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Calendar size={14} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '13px', fontWeight: '700' }}>Viewing Rhythm by Day</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DAY_ORDER.map(day => {
              const count = dayCounts[day] || 0;
              const pct = (count / maxDayVal) * 100;
              return (
                <div key={day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{day}</span>
                    <span>{count}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '2px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Directors Matrix */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <Star size={14} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '13px', fontWeight: '700' }}>Top Directors by Volume</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {topDirectors.map((d, idx) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  #{idx + 1} {d.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {d.count} films
                </div>
              </div>

              {d.avgRating && (
                <div style={{
                  background: 'var(--accent-gold-subtle)',
                  color: 'var(--accent-gold)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: '700'
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
