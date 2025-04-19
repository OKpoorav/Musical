import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { getLibraryItems, removeLibraryItem } from '../services/localLibrary';
import { FaHeart, FaPlay } from 'react-icons/fa';

// Modified card for library items
const LibraryDisplayCard = ({ item, onRemove }) => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const handleRemoveClick = useCallback((e) => {
    e.stopPropagation();
    onRemove(item.id, item.type);
  }, [item.id, item.type, onRemove]);

  // Handle click: Play track or navigate to album/playlist page
  const handleCardClick = () => {
    if (item.type === 'track') {
      // For tracks, immediately attempt playback
      playTrack({
        name: item.name,
        artist: item.artist,
        imageUrl: item.imageUrl
      });
    } else {
      // For albums/playlists, navigate to their detail page
      navigate(`/${item.type}/${item.id}`);
    }
  };
  
  // Separate handler for explicit play button on tracks
  const handlePlayButtonClick = (e) => {
      e.stopPropagation(); // Prevent card navigation
      playTrack({
        name: item.name,
        artist: item.artist,
        imageUrl: item.imageUrl
      });
  };

  return (
    <motion.div
      key={`${item.type}-${item.id}`}
      className={`search-result-card library-item-card ${item.type}-card`} 
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      onClick={handleCardClick}
      style={{ position: 'relative', cursor: 'pointer' }}
      layout 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img 
        src={item.imageUrl || '/album-thumb.png'} 
        alt={item.name} 
        className="search-card-image" 
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <div className="search-card-info">       
        <h3 title={item.name}>{item.name}</h3>
        <p title={item.artist}>{item.artist}</p>
      </div>
      {/* Show Play button overlay on hover for tracks */}
      {item.type === 'track' && (
          <button 
              onClick={handlePlayButtonClick} 
              className="card-play-button" 
              aria-label="Play Track">
              <FaPlay size={18} />
          </button>
      )}
      <button 
        onClick={handleRemoveClick} 
        className="library-toggle-btn search-card-toggle" 
        aria-label="Remove from library"
      >
        <FaHeart color="#1DB954" size={18} /> 
      </button>
    </motion.div>
  );
};

const Library = () => {
  const [libraryItems, setLibraryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLibraryItems(getLibraryItems());
    setIsLoading(false);
  }, []);

  const handleRemoveItem = useCallback((itemId, itemType) => {
    removeLibraryItem(itemId, itemType);
    setLibraryItems(prevItems => prevItems.filter(i => !(i.id === itemId && i.type === itemType)));
  }, []);

  const playlists = useMemo(() => libraryItems.filter(i => i.type === 'playlist'), [libraryItems]);
  const albums = useMemo(() => libraryItems.filter(i => i.type === 'album'), [libraryItems]);
  const tracks = useMemo(() => libraryItems.filter(i => i.type === 'track'), [libraryItems]);

  if (isLoading) {
    return <div className="loading">Loading Library...</div>;
  }

  return (
    <div className="library-page">
      <h1>Your Library</h1>

      {libraryItems.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Your library is empty. Add items from Home or Search using the ♡ icon!</p>
      ) : (
        <div className="search-results-container">
          {playlists.length > 0 && (
            <section className="result-section">            
              <h2>Playlists</h2>
              <div className="search-grid responsive-grid">
                {playlists.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section className="result-section">
              <h2>Albums</h2>
              <div className="search-grid responsive-grid">
                {albums.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </section>
          )}

          {tracks.length > 0 && (
            <section className="result-section">
              <h2>Tracks</h2>
              <div className="search-grid responsive-grid">
                {tracks.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Library; 