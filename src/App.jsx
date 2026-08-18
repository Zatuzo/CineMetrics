// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import QuickLogModal from './components/QuickLogModal';
import UploadModal from './components/UploadModal';

import HomeView from './views/HomeView';
import RewindView from './views/RewindView';
import MixesView from './views/MixesView';
import SemanticView from './views/SemanticView';
import AnalyticsView from './views/AnalyticsView';

import { SAMPLE_DIARY, SAMPLE_WATCHLIST } from './data/sampleData';
import { fetchSupabaseData } from './supabase';

export default function App() {
  const [diary, setDiary] = useState(SAMPLE_DIARY);
  const [watchlist, setWatchlist] = useState(SAMPLE_WATCHLIST);
  const [currentTab, setCurrentTab] = useState('home');
  const [activeMix, setActiveMix] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogFilm, setQuickLogFilm] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Function to load data from Supabase
  const loadFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetchSupabaseData("zatuzo");
      if (res && res.diary && res.diary.length > 0) {
        setDiary(res.diary);
        setIsDbLoaded(true);
      }
      if (res && res.watchlist && res.watchlist.length > 0) {
        setWatchlist(res.watchlist);
      }
    } catch (e) {
      console.warn("Could not connect to Supabase, fallback to sample:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-fetch from Supabase on mount
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const handleSaveFilm = (newFilm) => {
    setDiary(prev => [newFilm, ...prev]);
  };

  const handleDataLoaded = (newDiary, newWatchlist) => {
    if (newDiary && newDiary.length > 0) {
      setDiary(newDiary);
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
    <div className="app-container">
      <div className="app-body">
        {/* Left Navigation */}
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          totalFilms={diary.length}
        />

        {/* Main Content Stage */}
        <div className="main-wrapper">
          <Topbar
            onOpenQuickLog={() => handleOpenQuickLog(null)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectMovie={(m) => handleOpenQuickLog(m)}
          />

          <main className="main-stage">
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
          </main>
        </div>
      </div>

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
