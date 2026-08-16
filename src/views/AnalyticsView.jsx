// src/views/AnalyticsView.jsx
import React, { useState } from 'react';
import { BarChart2, Calendar, Film, Star, TrendingUp, Award } from 'lucide-react';
import { DAY_ORDER } from '../config';

export default function AnalyticsView({ diary }) {
  const [hoveredBar, setHoveredBar] = useState(null);

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

  // 1. Rating Distribution (0.5 to 5.0)
  const ratingCounts = {
    '0.5': 0, '1.0': 0, '1.5': 0, '2.0': 0, '2.5': 0,
    '3.0': 0, '3.5': 0, '4.0': 0, '4.5': 0, '5.0': 0
  };
  let totalRated = 0;
  diary.forEach(f => {
    if (f.rating) {
      const key = Number(f.rating).toFixed(1);
      if (ratingCounts[key] !== undefined) {
        ratingCounts[key] += 1;
        totalRated += 1;
      }
    }
  });
  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

  // 2. Monthly Trend (Chronological last 12 active months)
  const monthCounts = {};
  diary.forEach(f => {
    if (f.monthYear && f.monthYear !== 'Undated') {
      monthCounts[f.monthYear] = (monthCounts[f.monthYear] || 0) + 1;
    }
  });
  const sortedMonths = Object.keys(monthCounts).sort().slice(-12);
  const maxMonthCount = Math.max(...sortedMonths.map(m => monthCounts[m] || 0), 1);

  // 3. Decades Breakdown
  const decadeCounts = {};
  diary.forEach(f => {
    if (f.decade && f.decade !== 'N/A' && f.decade !== 'NaNs') {
      decadeCounts[f.decade] = (decadeCounts[f.decade] || 0) + 1;
    }
  });
  const decadesSorted = Object.keys(decadeCounts).sort();
  const maxDecadeVal = Math.max(...Object.values(decadeCounts), 1);

  // 4. Day of Week Distribution
  const dayCounts = {};
  DAY_ORDER.forEach(d => { dayCounts[d] = 0; });
  diary.forEach(f => {
    if (f.dayOfWeek && dayCounts[f.dayOfWeek] !== undefined) {
      dayCounts[f.dayOfWeek] += 1;
    }
  });
  const maxDayVal = Math.max(...Object.values(dayCounts), 1);

  // 5. Top Directors (Real directors only)
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Interactive graphs and historical metrics for your film diary.
        </p>
      </div>

      {/* Row 1: Rating Distribution Histogram & Monthly Activity Trend Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* GRAPH 1: Star Rating Histogram */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={15} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Rating Distribution</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalRated} rated films</span>
          </div>

          {/* Bar Chart Area */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '8px', paddingBottom: '24px', position: 'relative' }}>
            {Object.keys(ratingCounts).map(rating => {
              const count = ratingCounts[rating];
              const heightPct = (count / maxRatingCount) * 100;
              const isHovered = hoveredBar === `rating_${rating}`;

              return (
                <div
                  key={rating}
                  style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}
                  onMouseEnter={() => setHoveredBar(`rating_${rating}`)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      top: '-24px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-hover)',
                      color: 'var(--text-primary)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      zIndex: 10
                    }}>
                      {count} films ({Math.round((count / (totalRated || 1)) * 100)}%)
                    </div>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(heightPct, 3)}%`,
                      background: isHovered ? 'var(--accent-red)' : 'var(--accent-red-subtle)',
                      borderTop: '2px solid var(--accent-red)',
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '-18px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {rating}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 2: Monthly Viewing Velocity Trend */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={15} color="var(--accent-red)" />
              <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Monthly Activity Trend</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Last 12 active months</span>
          </div>

          {/* SVG Area / Line Chart */}
          <div style={{ position: 'relative', height: '140px' }}>
            {sortedMonths.length > 1 ? (
              <svg viewBox="0 0 400 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--accent-red)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="55" x2="400" y2="55" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="var(--border-subtle)" />

                {/* Path calculation */}
                {(() => {
                  const pts = sortedMonths.map((m, i) => {
                    const x = (i / (sortedMonths.length - 1)) * 390 + 5;
                    const val = monthCounts[m] || 0;
                    const y = 90 - ((val / maxMonthCount) * 75);
                    return { x, y, val, m };
                  });

                  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${pts[pts.length - 1].x} 90 L ${pts[0].x} 90 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#areaGradient)" />
                      <path d={linePath} fill="none" stroke="var(--accent-red)" strokeWidth="2.5" strokeLinecap="round" />
                      {pts.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={3.5}
                          fill="var(--bg-canvas)"
                          stroke="var(--accent-red)"
                          strokeWidth="2"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>
                Log more months to view trendline
              </div>
            )}

            {/* Bottom Month Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>{sortedMonths[0] || ''}</span>
              <span>{sortedMonths[Math.floor(sortedMonths.length / 2)] || ''}</span>
              <span>{sortedMonths[sortedMonths.length - 1] || ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Decade Distribution & Weekly Rhythm Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* GRAPH 3: Decade Distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Film size={15} color="var(--accent-red)" />
            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Decade Distribution</h3>
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
                  <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '2px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 4: Day of Week Rhythm */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Calendar size={15} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Weekly Viewing Rhythm</h3>
          </div>

          {/* Vertical Columns for Days of the Week */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '110px', gap: '10px', paddingBottom: '20px' }}>
            {DAY_ORDER.map(day => {
              const count = dayCounts[day] || 0;
              const pct = (count / maxDayVal) * 100;

              return (
                <div key={day} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(pct, 4)}%`,
                      background: 'var(--accent-gold-subtle)',
                      borderTop: '2px solid var(--accent-gold)',
                      borderRadius: '2px 2px 0 0'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '-16px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {day.slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Directors Ranking */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Award size={15} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Top Directors</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
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
                  {d.count} films logged
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
