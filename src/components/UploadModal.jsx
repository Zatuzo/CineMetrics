// src/components/UploadModal.jsx
import React, { useState } from 'react';
import { X, Upload, CheckCircle2, RotateCcw, Film } from 'lucide-react';
import { processLetterboxdFiles } from '../services/csvParser';

export default function UploadModal({ isOpen, onClose, onDataLoaded, onResetDemo }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setStatusMsg('Reading Letterboxd CSVs and syncing archive...');

    try {
      const { diary, watchlist } = await processLetterboxdFiles(files, (pct) => {
        setProgress(pct);
      });

      if (diary.length > 0 || watchlist.length > 0) {
        onDataLoaded(diary, watchlist);
        setStatusMsg(`Imported ${diary.length} diary screenings & ${watchlist.length} watchlist titles!`);
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 1000);
      } else {
        setStatusMsg('No valid diary or watchlist rows found in selected CSVs.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Error processing files. Please upload Letterboxd export CSVs.');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>📥 Import Letterboxd Archive</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fda4af', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: '#fda4af', fontSize: '13px', marginBottom: '18px', lineHeight: 1.5 }}>
          Export your Letterboxd archive (Settings &rarr; Import & Export) and drop your <b>diary.csv</b>, <b>ratings.csv</b>, and <b>watchlist.csv</b>.
        </p>

        {/* Dropzone */}
        <div
          style={{
            border: `2px dashed ${dragActive ? '#e11d48' : 'rgba(225, 29, 72, 0.25)'}`,
            borderRadius: '10px',
            padding: '32px 18px',
            textAlign: 'center',
            background: dragActive ? 'rgba(225, 29, 72, 0.08)' : 'rgba(225, 29, 72, 0.02)',
            transition: 'all 0.2s ease',
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
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(225, 29, 72, 0.15)',
            color: '#e11d48',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Film size={22} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff1f2', marginBottom: '3px' }}>
            Drop Letterboxd CSVs here (Instant Import)
          </div>
          <div style={{ fontSize: '11px', color: '#9f7580' }}>
            Supports diary.csv, ratings.csv, reviews.csv, watchlist.csv
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fda4af', marginBottom: '4px' }}>
              <span>{statusMsg}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#e11d48', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        {statusMsg && !isProcessing && (
          <div style={{ marginTop: '14px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} />
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid rgba(225, 29, 72, 0.15)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => {
              onResetDemo();
              onClose();
            }}
          >
            <RotateCcw size={13} />
            <span>Load Sample Archive</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
