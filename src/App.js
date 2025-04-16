import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BiHome, BiSearch, BiLibrary } from 'react-icons/bi';
import { BsPlayFill, BsPauseFill, BsSkipStart, BsSkipEnd, BsVolumeUp } from 'react-icons/bs';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            <div className="now-playing-mini">
              <img src="/album-thumb.png" alt="Current track" />
              <div className="track-info">
                <h4>Current Track</h4>
                <p>Artist Name</p>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
            </Routes>
          </main>

          {/* Player Bar */}
          <div className="player-bar">
            <div className="now-playing">
              <img src="/album-thumb.png" alt="Current track" />
              <div className="track-info">
                <h4>Current Track</h4>
                <p>Artist Name</p>
              </div>
            </div>
            <div className="player-controls">
              <button className="previous">
                <BsSkipStart size={20} />
              </button>
              <button className="play">
                <BsPlayFill size={24} />
              </button>
              <button className="next">
                <BsSkipEnd size={20} />
              </button>
            </div>
            <div className="volume-controls">
              <BsVolumeUp size={20} />
              <input type="range" min="0" max="100" defaultValue="50" />
            </div>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
