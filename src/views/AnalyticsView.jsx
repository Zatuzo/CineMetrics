// src/views/AnalyticsView.jsx
import React from 'react';
import { BarChart3, Calendar, Film, Star, TrendingUp } from 'lucide-react';
import { DAY_ORDER } from '../config';

export default function AnalyticsView({ diary }) {
  if (diary.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px' }}>
        <BarChart3 size={40} color="#38bdf8" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', color: '#f8fafc' }}>No watch data available for analytics</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Log movies or upload your Letterboxd diary to generate insights.
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

  // Top Directors by volume & mean rating
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

  // Monthly Velocity
  const monthCounts = {};
  diary.forEach(f => {
    if (f.monthYear && f.monthYear !== 'Undated') {
      monthCounts[f.monthYear] = (monthCounts[f.monthYear] || 0) + 1;
    }
  });
  const monthsSorted = Object.keys(monthCounts).sort();
  const maxMonthVal = Math.max(...Object.values(monthCounts), 1);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>📊 Taste & Habits Analytics</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Deep analytical breakdown of your historical volume, decade preferences, and weekly rhythms.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Decades Distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Film size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Decade Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {decadesSorted.map(decade => {
              const count = decadeCounts[decade];
              const pct = (count / maxDecadeVal) * 100;
              return (
                <div key={decade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc' }}>{decade}</span>
                    <span>{count} films</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-of-Week Rhythm */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Calendar size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Day-of-Week Viewing Rhythm</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DAY_ORDER.map(day => {
              const count = dayCounts[day] || 0;
              const pct = (count / maxDayVal) * 100;
              return (
                <div key={day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc' }}>{day}</span>
                    <span>{count} logged</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Directors Matrix */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Star size={18} color="#10b981" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Top Auteurs by Volume & Mean Rating</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {topDirectors.map((d, idx) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                  #{idx + 1} {d.name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {d.count} films in diary
                </div>
              </div>

              {d.avgRating && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
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
