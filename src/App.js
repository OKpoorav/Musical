import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BiHome, BiSearch, BiLibrary } from 'react-icons/bi';
import { BsPlayFill, BsPauseFill, BsSkipStart, BsSkipEnd, BsVolumeUp } from 'react-icons/bs';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import ErrorBoundary from './components/ErrorBoundary';
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

function NowPlayingDisplay({ mini = false }) {
  const { currentTrack } = usePlayer();

  return (
    <div className={mini ? "now-playing-mini" : "now-playing"}>
      <img 
        src={currentTrack.imageUrl || '/album-thumb.png'} 
        alt={currentTrack.name} 
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <div className="track-info">
        <h4>{currentTrack.name}</h4>
        <p>{currentTrack.artist}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <Router>
          <div className="app">
            {/* Left Sidebar */}
            <nav className="sidebar">
              <div className="logo">
                <h1>Musical</h1>
              </div>
              <ul className="nav-links">
                <li>
                  <Link to="/" className="nav-link">
                    <BiHome size={24} />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="nav-link">
                    <BiSearch size={24} />
                    <span>Search</span>
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="nav-link">
                    <BiLibrary size={24} />
                    <span>Your Library</span>
                  </Link>
                </li>
              </ul>
              <NowPlayingDisplay mini={true} />
            </nav>

            {/* Main Content */}
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                </Routes>
              </ErrorBoundary>
            </main>

            {/* Player Bar */}
            <div className="player-bar">
              <NowPlayingDisplay mini={false} />
              <div className="player-controls">
                <button className="previous" disabled>
                  <BsSkipStart size={20} />
                </button>
                <button className="play" disabled>
                  <BsPlayFill size={24} />
                </button>
                <button className="next" disabled>
                  <BsSkipEnd size={20} />
                </button>
              </div>
              <div className="volume-controls">
                <BsVolumeUp size={20} />
                <input type="range" min="0" max="100" defaultValue="50" disabled />
              </div>
            </div>
          </div>
        </Router>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
