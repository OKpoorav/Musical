import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { getLibraryItems, removeLibraryItem } from '../services/localLibrary';
import { FaHeart } from 'react-icons/fa'; // Only need filled heart for remove

// Reusable Card for displaying library items
const LibraryDisplayCard = ({ item, onRemove, onClick }) => {
  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onRemove(item.id, item.type);
  };

  return (
    <motion.div
      key={`${item.type}-${item.id}`} // Unique key combining type and id
      className={`${item.type}-card library-item-card`} // Add specific class
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)} // Use the passed onClick handler
      style={{ cursor: 'pointer', position: 'relative' }}
      layout // Animate layout changes when items are removed
    >
      <img 
        src={item.imageUrl || '/album-thumb.png'} 
        alt={item.name} 
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <div className="track-info">
        <h3>{item.name}</h3>
        <p>{item.artist}</p>
      </div>
       {/* Remove Button (using filled heart) */}
      <button 
        onClick={handleRemoveClick} 
        className="library-toggle-btn" 
        aria-label="Remove from library"
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.6)', 
          border: 'none', 
          borderRadius: '50%', 
          padding: '8px', 
          cursor: 'pointer' 
        }}
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

  // Load items from local storage on mount
  useEffect(() => {
    setLibraryItems(getLibraryItems());
    setIsLoading(false);
  }, []);

  // Function to handle removing an item
  const handleRemoveItem = useCallback((itemId, itemType) => {
    removeLibraryItem(itemId, itemType);
    // Update state to reflect removal immediately
    setLibraryItems(prevItems => prevItems.filter(i => !(i.id === itemId && i.type === itemType)));
  }, []);

  // Function to handle clicking an item card
  const handleItemClick = useCallback((item) => {
    setCurrentTrack({
      name: item.name,
      artist: item.artist,
      imageUrl: item.imageUrl
    });
  }, [setCurrentTrack]);

  // Memoize filtered items to avoid re-filtering on every render
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
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Your library is empty. Add items from Home or Search!</p>
      ) : (
        <>
          {/* Playlists Section */}          
          {playlists.length > 0 && (
            <section className="library-section">
              <h2>Playlists</h2>
              <div className="playlists-grid">
                {playlists.map((item) => (
                  <LibraryDisplayCard 
                    key={item.id} 
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}          
          {albums.length > 0 && (
            <section className="library-section">
              <h2>Albums</h2>
              <div className="albums-grid">
                {albums.map((item) => (
                  <LibraryDisplayCard 
                    key={item.id} 
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tracks Section */}          
          {tracks.length > 0 && (
            <section className="library-section">
              <h2>Tracks</h2>
              <div className="tracks-grid">
                {tracks.map((item) => (
                  <LibraryDisplayCard 
                    key={item.id} 
                    item={item} 
                    onRemove={handleRemoveItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Library; 