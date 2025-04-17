import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { getLibraryItems, removeLibraryItem } from '../services/localLibrary';
import { FaHeart } from 'react-icons/fa';

// Adapted card for library items, mirroring search card style
const LibraryDisplayCard = ({ item, onRemove, onClick }) => {
  const handleRemoveClick = useCallback((e) => {
    e.stopPropagation();
    onRemove(item.id, item.type);
  }, [item.id, item.type, onRemove]);

  return (
    <motion.div
      key={`${item.type}-${item.id}`}
      className={`search-result-card library-item-card ${item.type}-card`} // Use search card base class
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      onClick={() => onClick(item)}
      style={{ position: 'relative' }}
      layout // Animate layout changes
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img 
        src={item.imageUrl || '/album-thumb.png'} 
        alt={item.name} 
        className="search-card-image" // Use search card image class
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <div className="search-card-info"> {/* Use search card info class */}      
        <h3 title={item.name}>{item.name}</h3>
        <p title={item.artist}>{item.artist}</p>
      </div>
      <button 
        onClick={handleRemoveClick} 
        className="library-toggle-btn search-card-toggle" // Use search card toggle class
        aria-label="Remove from library"
      >
        <FaHeart color="#1DB954" size={18} /> 
      </button>
    </motion.div>
  );
};

const Library = () => {
  const { setCurrentTrack } = usePlayer();
  const [libraryItems, setLibraryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate slight delay for visual feedback if needed
    // setTimeout(() => {
      setLibraryItems(getLibraryItems());
      setIsLoading(false);
    // }, 100); 
  }, []);

  const handleRemoveItem = useCallback((itemId, itemType) => {
    removeLibraryItem(itemId, itemType);
    setLibraryItems(prevItems => prevItems.filter(i => !(i.id === itemId && i.type === itemType)));
  }, []);

  const handleItemClick = useCallback((item) => {
    setCurrentTrack({
      name: item.name,
      artist: item.artist,
      imageUrl: item.imageUrl
    });
  }, [setCurrentTrack]);

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
        <div className="search-results-container"> {/* Use container from search */}        
          {playlists.length > 0 && (
            <section className="result-section"> {/* Use section class from search */}            
              <h2>Playlists</h2>
              <div className="search-grid"> {/* Use grid class from search */}              
                {playlists.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section className="result-section">
              <h2>Albums</h2>
              <div className="search-grid">
                {albums.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </section>
          )}

          {tracks.length > 0 && (
            <section className="result-section">
              <h2>Tracks</h2>
              <div className="search-grid">
                {tracks.map((item) => (
                  <LibraryDisplayCard 
                    key={`${item.type}-${item.id}`}
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
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