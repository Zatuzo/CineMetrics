// src/components/UploadModal.jsx
import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { processLetterboxdFiles } from '../services/csvParser';
import { SAMPLE_DIARY, SAMPLE_WATCHLIST } from '../data/sampleData';

export default function UploadModal({ isOpen, onClose, onDataLoaded, onResetDemo }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setStatusMsg('Parsing Letterboxd CSVs and syncing TMDb metadata...');

    try {
      const { diary, watchlist } = await processLetterboxdFiles(files, (pct) => {
        setProgress(pct);
      });

      if (diary.length > 0 || watchlist.length > 0) {
        onDataLoaded(diary, watchlist);
        setStatusMsg(`Successfully synced ${diary.length} diary entries and ${watchlist.length} watchlist films!`);
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 1200);
      } else {
        setStatusMsg('No valid diary or watchlist rows found in selected CSVs.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Error processing files. Please ensure you uploaded Letterboxd export CSVs.');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>📥 Sync Letterboxd Data</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
          Export your Letterboxd account data (Settings &rarr; Import & Export &rarr; Export Data) and drop your <b>diary.csv</b>, <b>ratings.csv</b>, and <b>watchlist.csv</b> here.
        </p>

        {/* Dropzone Area */}
        <div
          style={{
            border: `2px dashed ${dragActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            background: dragActive ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.02)',
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
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Upload size={24} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
            Click or drag Letterboxd CSVs here
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Supports diary.csv, ratings.csv, reviews.csv, watchlist.csv
          </div>
        </div>

        {/* Progress feedback */}
        {isProcessing && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
              <span>{statusMsg}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        {statusMsg && !isProcessing && (
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Footer with Demo Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
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
            <span>Load Sample Demo Data</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
