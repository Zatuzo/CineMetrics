// src/views/AnalyticsView.jsx
import React, { useState } from 'react';
import { BarChart2, Calendar, Film, Star, TrendingUp, Award } from 'lucide-react';
import { DAY_ORDER } from '../config';

export default function AnalyticsView({ diary }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (diary.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 20px', background: '#141a24', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <BarChart2 size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
        <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>No diary data available</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
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
    const r = f.rating || f.Rating;
    if (r) {
      const key = Number(r).toFixed(1);
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
    const my = f.monthYear || f.Month_Year;
    if (my && my !== 'Undated') {
      monthCounts[my] = (monthCounts[my] || 0) + 1;
    }
  });
  const sortedMonths = Object.keys(monthCounts).sort().slice(-12);
  const maxMonthCount = Math.max(...sortedMonths.map(m => monthCounts[m] || 0), 1);

  // 3. Decades Breakdown
  const decadeCounts = {};
  diary.forEach(f => {
    const dec = f.decade || f.Decade;
    if (dec && dec !== 'N/A' && dec !== 'NaNs') {
      decadeCounts[dec] = (decadeCounts[dec] || 0) + 1;
    }
  });
  const decadesSorted = Object.keys(decadeCounts).sort();
  const maxDecadeVal = Math.max(...Object.values(decadeCounts), 1);

  // 4. Day of Week Distribution
  const dayCounts = {};
  DAY_ORDER.forEach(d => { dayCounts[d] = 0; });
  diary.forEach(f => {
    const day = f.dayOfWeek || f.Day_of_Week;
    if (day && dayCounts[day] !== undefined) {
      dayCounts[day] += 1;
    }
  });
  const maxDayVal = Math.max(...Object.values(dayCounts), 1);

  // 5. Top Directors (Real directors only)
  const dirMap = {};
  diary.forEach(f => {
    const dStr = f.director || f.Director;
    if (dStr && dStr !== 'Unknown Director' && dStr !== 'Auteur' && dStr !== 'Unknown') {
      const dirs = dStr.split(',').map(d => d.trim());
      dirs.forEach(d => {
        if (d && d !== 'Auteur' && d !== 'Unknown Director') {
          if (!dirMap[d]) dirMap[d] = { count: 0, totalRating: 0, ratingCount: 0 };
          dirMap[d].count += 1;
          const r = f.rating || f.Rating;
          if (r) {
            dirMap[d].totalRating += Number(r);
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
    .slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Viewing Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '3px' }}>
          Interactive graphs, rating curves, and historical metrics for your film diary.
        </p>
      </div>

      {/* Row 1: Rating Distribution Histogram & Monthly Activity Trend Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* GRAPH 1: Star Rating Histogram */}
        <div style={{ background: '#141a24', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="var(--accent-gold)" fill="var(--accent-gold)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Rating Distribution</h3>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{totalRated} rated films</span>
          </div>

          {/* Bar Chart Area */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '170px', gap: '10px', paddingBottom: '28px', position: 'relative' }}>
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
                      top: '-28px',
                      background: '#1c2433',
                      border: '1px solid var(--border-hover)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      {count} films ({Math.round((count / (totalRated || 1)) * 100)}%)
                    </div>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(heightPct, 3)}%`,
                      background: isHovered ? 'var(--accent-ruby)' : 'var(--accent-ruby-subtle)',
                      borderTop: '2px solid var(--accent-ruby)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '-22px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {rating}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 2: Monthly Viewing Velocity Trend */}
        <div style={{ background: '#141a24', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent-ruby)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Monthly Activity Trend</h3>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last 12 active months</span>
          </div>

          {/* SVG Area / Line Chart */}
          <div style={{ position: 'relative', height: '170px' }}>
            {sortedMonths.length > 1 ? (
              <svg viewBox="0 0 400 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-ruby)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent-ruby)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="25" x2="400" y2="25" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="400" y2="65" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="105" x2="400" y2="105" stroke="var(--border-subtle)" />

                {/* Path calculation */}
                {(() => {
                  const pts = sortedMonths.map((m, i) => {
                    const x = (i / (sortedMonths.length - 1)) * 390 + 5;
                    const val = monthCounts[m] || 0;
                    const y = 105 - ((val / maxMonthCount) * 85);
                    return { x, y, val, m };
                  });

                  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${pts[pts.length - 1].x} 105 L ${pts[0].x} 105 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#areaGradient)" />
                      <path d={linePath} fill="none" stroke="var(--accent-ruby)" strokeWidth="3" strokeLinecap="round" />
                      {pts.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill="#0a0d14"
                          stroke="var(--accent-ruby)"
                          strokeWidth="2.5"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                Log more months to view trendline
              </div>
            )}

            {/* Bottom Month Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              <span>{sortedMonths[0] || ''}</span>
              <span>{sortedMonths[Math.floor(sortedMonths.length / 2)] || ''}</span>
              <span>{sortedMonths[sortedMonths.length - 1] || ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Decade Distribution & Weekly Rhythm Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* GRAPH 3: Decade Distribution */}
        <div style={{ background: '#141a24', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Film size={18} color="var(--accent-ruby)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Decade Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {decadesSorted.map(decade => {
              const count = decadeCounts[decade];
              const pct = (count / maxDecadeVal) * 100;
              return (
                <div key={decade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{decade}</span>
                    <span>{count} films</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0e121a', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-ruby), var(--accent-coral))', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 4: Day of Week Rhythm */}
        <div style={{ background: '#141a24', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Calendar size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Weekly Viewing Rhythm</h3>
          </div>

          {/* Vertical Columns for Days of the Week */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '14px', paddingBottom: '24px' }}>
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
                      borderRadius: '3px 3px 0 0'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '-20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {day.slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Directors Ranking */}
      <div style={{ background: '#141a24', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Award size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Top Directors</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {topDirectors.map((d, idx) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: '#0e121a',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  #{idx + 1} {d.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {d.count} films logged
                </div>
              </div>

              {d.avgRating && (
                <div style={{
                  background: 'var(--accent-gold-subtle)',
                  color: 'var(--accent-gold)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '800'
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
