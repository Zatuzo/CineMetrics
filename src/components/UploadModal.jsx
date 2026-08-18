// src/components/UploadModal.jsx
import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Database, RefreshCw } from 'lucide-react';
import { processLetterboxdFiles } from '../services/csvParser';
import { fetchSupabaseData } from '../supabase';

export default function UploadModal({ isOpen, onClose, onDataLoaded, onResetDemo }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSupabaseSync = async () => {
    setIsProcessing(true);
    setStatusMsg('Connecting to Supabase...');
    try {
      const res = await fetchSupabaseData("zatuzo");
      if (res && (res.diary.length > 0 || res.watchlist.length > 0)) {
        onDataLoaded(res.diary, res.watchlist);
        setStatusMsg(`Synced ${res.diary.length} viewing logs and ${res.watchlist.length} watchlist movies from Supabase!`);
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 800);
      } else {
        setStatusMsg('No records returned from Supabase.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to sync from Supabase.');
      setIsProcessing(false);
    }
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setStatusMsg('Importing Letterboxd data...');

    try {
      const { diary, watchlist } = await processLetterboxdFiles(files, (pct) => {
        setProgress(pct);
      });

      if (diary.length > 0 || watchlist.length > 0) {
        onDataLoaded(diary, watchlist);
        setStatusMsg(`Imported ${diary.length} diary films & ${watchlist.length} watchlist items.`);
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 800);
      } else {
        setStatusMsg('No valid rows found in selected CSV files.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Error reading files. Please upload Letterboxd export CSVs.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Sync Data Source</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.4 }}>
          Sync your 650+ films directly from Supabase or upload new Letterboxd export files.
        </p>

        {/* 1. Supabase Fast Sync Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
            onClick={handleSupabaseSync}
            disabled={isProcessing}
          >
            <Database size={16} />
            <span>⚡ Sync From Supabase Database</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          — or upload local export CSVs —
        </div>

        {/* 2. Dropzone */}
        <div
          style={{
            border: `1px dashed ${dragActive ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '24px 16px',
            textAlign: 'center',
            background: dragActive ? 'var(--accent-red-subtle)' : 'var(--bg-card)',
            transition: 'all 0.15s ease',
            cursor: 'pointer'
          }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            multiple
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(Array.from(e.target.files))}
          />
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            color: 'var(--accent-red)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Upload size={16} />
          </div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
            Click or drag Letterboxd CSVs here
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Supports diary.csv, ratings.csv, watchlist.csv
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>{statusMsg}</span>
              {progress > 0 && <span>{progress}%</span>}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: progress > 0 ? `${progress}%` : '100%', height: '100%', background: 'var(--accent-red)', transition: 'width 0.15s ease' }} />
            </div>
          </div>
        )}

        {statusMsg && !isProcessing && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
