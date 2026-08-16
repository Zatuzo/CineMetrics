// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomPlayer from './components/BottomPlayer';
import QuickLogModal from './components/QuickLogModal';
import UploadModal from './components/UploadModal';

import HomeView from './views/HomeView';
import RewindView from './views/RewindView';
import MixesView from './views/MixesView';
import SemanticView from './views/SemanticView';
import AnalyticsView from './views/AnalyticsView';

import { SAMPLE_DIARY, SAMPLE_WATCHLIST } from './data/sampleData';

export default function App() {
  const [diary, setDiary] = useState(SAMPLE_DIARY);
  const [watchlist, setWatchlist] = useState(SAMPLE_WATCHLIST);
  const [currentTab, setCurrentTab] = useState('home');
  const [activeMovie, setActiveMovie] = useState(SAMPLE_DIARY[0] || null);
  const [activeMix, setActiveMix] = useState(null);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogFilm, setQuickLogFilm] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleSaveFilm = (newFilm) => {
    setDiary(prev => [newFilm, ...prev]);
    setActiveMovie(newFilm);
  };

  const handleDataLoaded = (newDiary, newWatchlist) => {
    if (newDiary && newDiary.length > 0) {
      setDiary(newDiary);
      setActiveMovie(newDiary[0]);
    }
    if (newWatchlist && newWatchlist.length > 0) {
      setWatchlist(newWatchlist);
    }
  };

  const handleResetDemo = () => {
    setDiary(SAMPLE_DIARY);
    setWatchlist(SAMPLE_WATCHLIST);
    setActiveMovie(SAMPLE_DIARY[0]);
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
        {/* Left Spotify-style Navigation */}
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
            onSelectMovie={(m) => {
              setActiveMovie(m);
            }}
          />

          <main className="main-stage">
            {currentTab === 'home' && (
              <HomeView
                diary={diary}
                watchlist={watchlist}
                onSelectMovie={setActiveMovie}
                onSelectMix={handleSelectMix}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'rewind' && (
              <RewindView
                diary={diary}
                onSelectMovie={setActiveMovie}
              />
            )}

            {currentTab === 'mixes' && (
              <MixesView
                diary={diary}
                watchlist={watchlist}
                onSelectMovie={setActiveMovie}
                activeMix={activeMix}
              />
            )}

            {currentTab === 'semantic' && (
              <SemanticView
                watchlist={watchlist}
                onSelectMovie={setActiveMovie}
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

      {/* Bottom Sticky Player / Inspector Dock */}
      <BottomPlayer
        activeMovie={activeMovie}
        onOpenQuickLog={handleOpenQuickLog}
      />

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
