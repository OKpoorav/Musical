import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BiHome, BiSearch, BiLibrary } from 'react-icons/bi';
import { BsPlayFill, BsPauseFill, BsMusicNoteBeamed } from 'react-icons/bs';
import { FiMenu, FiX } from "react-icons/fi";
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import TrackPage from './pages/TrackPage';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import ErrorBoundary from './components/ErrorBoundary';
import YouTubePlayer from './components/YouTubePlayer';
import ProgressBar from './components/ProgressBar';
import VolumeControl from './components/VolumeControl.jsx';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    },
  },
});

function PlayerControls() {
  const { isPlaying, togglePlayPause } = usePlayer();

  const handlePlayPauseClick = () => {
    togglePlayPause();
  };

  return (
    <div className="player-controls">
      {/* Remove Previous Button */}
      {/* 
      <button className="previous" disabled> 
        <BsSkipStart size={20} />
      </button> 
      */}
      <button className="play" onClick={handlePlayPauseClick} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <BsPauseFill size={24} /> : <BsPlayFill size={24} />}
      </button>
      {/* Remove Next Button */}
      {/* 
      <button className="next" disabled> 
        <BsSkipEnd size={20} />
      </button> 
      */}
    </div>
  );
}

function NowPlayingDisplay({ mini = false }) {
  const { currentTrack } = usePlayer();
  const placeholderIconSize = mini ? 24 : 30;

  return (
    <div className={mini ? "now-playing-mini" : "now-playing"}>
      {/* Conditionally render image or placeholder */}
      {currentTrack.imageUrl ? (
        <img 
          src={currentTrack.imageUrl} 
          alt={currentTrack.name} 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.style.display = 'none'; // Hide broken image
            // Optionally show the placeholder again if image fails
            const placeholder = e.target.nextSibling;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : (
        <div className="now-playing-placeholder-icon" style={{ 
          width: mini ? '48px' : '56px', 
          height: mini ? '48px' : '56px' 
        }}>
          <BsMusicNoteBeamed size={placeholderIconSize} color="var(--text-subdued)" />
        </div>
      )}
      {/* Placeholder element for error handling */}      
      {currentTrack.imageUrl && (
        <div className="now-playing-placeholder-icon" style={{ 
            width: mini ? '48px' : '56px', 
            height: mini ? '48px' : '56px', 
            display: 'none' // Initially hidden
          }}>
            <BsMusicNoteBeamed size={placeholderIconSize} color="var(--text-subdued)" />
          </div>
      )}

      <div className="track-info">
        <h4>{currentTrack.name}</h4>
        <p>{currentTrack.artist}</p>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <YouTubePlayer />
        <Router>
          <div className={`app ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            {/* Left Sidebar */}
            <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <div className="logo">
                <h1>Musical</h1>
              </div>
              <button onClick={toggleSidebar} className="sidebar-close-button" aria-label="Close sidebar">
                <FiX size={24}/>
              </button>
              <ul className="nav-links">
                <li>
                  <Link to="/" className="nav-link" onClick={isSidebarOpen ? toggleSidebar : undefined}>
                    <BiHome size={24} />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="nav-link" onClick={isSidebarOpen ? toggleSidebar : undefined}>
                    <BiSearch size={24} />
                    <span>Search</span>
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="nav-link" onClick={isSidebarOpen ? toggleSidebar : undefined}>
                    <BiLibrary size={24} />
                    <span>Your Library</span>
                  </Link>
                </li>
              </ul>
              <NowPlayingDisplay mini={true} />
            </nav>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            {/* Main Content */}
            <main className="main-content">
              <header className="main-header">
                <button onClick={toggleSidebar} className="menu-button" aria-label="Open sidebar">
                  <FiMenu size={24} />
                </button>
                <div className="logo">
                  <h1>Musical</h1>
                </div>
              </header>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/track/:id" element={<TrackPage />} />
                  <Route path="/album/:id" element={<AlbumPage />} />
                  <Route path="/artist/:id" element={<ArtistPage />} />
                </Routes>
              </ErrorBoundary>
            </main>

            {/* Player Bar */}
            <div className="player-bar">
              <NowPlayingDisplay mini={false} />
              <div className="player-center-controls">
                <PlayerControls />
                <ProgressBar />
              </div>
              <VolumeControl />
            </div>
          </div>
        </Router>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
