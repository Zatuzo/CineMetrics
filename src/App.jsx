// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import LetterboxdNav from './components/LetterboxdNav';
import LetterboxdBanner from './components/LetterboxdBanner';
import QuickLogModal from './components/QuickLogModal';
import UploadModal from './components/UploadModal';

import HomeView from './views/HomeView';
import RewindView from './views/RewindView';
import MixesView from './views/MixesView';
import SemanticView from './views/SemanticView';
import AnalyticsView from './views/AnalyticsView';

import userLibrary from './data/userLibrary.json';
import { fetchSupabaseData } from './supabase';

export default function App() {
  // Initialize immediately with your full Supabase library
  const [diary, setDiary] = useState(userLibrary.diary || []);
  const [watchlist, setWatchlist] = useState(userLibrary.watchlist || []);
  const [currentTab, setCurrentTab] = useState('home');
  const [activeMix, setActiveMix] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbSource, setDbSource] = useState('supabase');

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogFilm, setQuickLogFilm] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Real-time Supabase background sync
  const loadFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      console.log("⚡ Syncing latest updates from Supabase...");
      const res = await fetchSupabaseData("zatuzo");
      if (res && res.diary && res.diary.length > 0) {
        setDiary(res.diary);
        setDbSource('supabase');
      }
      if (res && res.watchlist && res.watchlist.length > 0) {
        setWatchlist(res.watchlist);
      }
    } catch (e) {
      console.warn("Supabase background sync notice:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on startup
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const handleSaveFilm = (newFilm) => {
    setDiary(prev => [newFilm, ...prev]);
  };

  const handleDataLoaded = (newDiary, newWatchlist) => {
    if (newDiary && newDiary.length > 0) {
      setDiary(newDiary);
      setDbSource('upload');
    }
    if (newWatchlist && newWatchlist.length > 0) {
      setWatchlist(newWatchlist);
    }
  };

  const handleResetDemo = () => {
    loadFromSupabase();
  };

  const handleOpenQuickLog = (film = null) => {
    setQuickLogFilm(film);
    setIsQuickLogOpen(true);
  };

  const handleSelectMix = (mix) => {
    setActiveMix(mix);
    setCurrentTab('mixes');
  };

  return (
    <div className="lb-app-shell">
      {/* 1. Letterboxd-Style Top Navbar */}
      <LetterboxdNav
        currentTab={currentTab}
        setTab={setCurrentTab}
        onOpenQuickLog={() => handleOpenQuickLog(null)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSelectMovie={(m) => handleOpenQuickLog(m)}
        totalFilms={diary.length}
        watchlistCount={watchlist.length}
      />

      {/* 2. Letterboxd Welcome & Stats Ribbon */}
      <LetterboxdBanner
        diary={diary}
        watchlist={watchlist}
        onNavigate={setCurrentTab}
      />

      {/* 3. Centered Content Container */}
      <main className="lb-main-wrapper">
        <div className="lb-container">
          {currentTab === 'home' && (
            <HomeView
              diary={diary}
              watchlist={watchlist}
              onSelectMovie={handleOpenQuickLog}
              onSelectMix={handleSelectMix}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'rewind' && (
            <RewindView
              diary={diary}
              onSelectMovie={handleOpenQuickLog}
            />
          )}

          {currentTab === 'mixes' && (
            <MixesView
              diary={diary}
              watchlist={watchlist}
              onSelectMovie={handleOpenQuickLog}
              activeMix={activeMix}
            />
          )}

          {currentTab === 'semantic' && (
            <SemanticView
              watchlist={watchlist}
              onSelectMovie={handleOpenQuickLog}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              diary={diary}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        initialMovie={quickLogFilm}
        onClose={() => setIsQuickLogOpen(false)}
        onSaveFilm={handleSaveFilm}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
