import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BiHome, BiSearch, BiLibrary } from 'react-icons/bi';
import { BsPlayFill, BsSkipStart, BsSkipEnd, BsVolumeUp, BsMusicNoteBeamed } from 'react-icons/bs';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import CategoryPlaylists from './pages/CategoryPlaylists';
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
                  <Route path="/category/:categoryId" element={<CategoryPlaylists />} />
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
