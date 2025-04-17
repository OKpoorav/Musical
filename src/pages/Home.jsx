import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNewReleases, getFeaturedPlaylists } from '../services/spotify';
import { usePlayer } from '../context/PlayerContext';
import { addLibraryItem, removeLibraryItem, isItemInLibrary } from '../services/localLibrary';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Heart icons

// Component for individual album/playlist cards
const LibraryItemCard = ({ item, type, onClick, onToggleLibrary }) => {
  const [isInLibrary, setIsInLibrary] = useState(false);

  useEffect(() => {
    setIsInLibrary(isItemInLibrary(item.id, type));
  }, [item.id, type]);

  const handleToggleLibrary = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the heart
    if (isInLibrary) {
      removeLibraryItem(item.id, type);
    } else {
      addLibraryItem({
        id: item.id,
        type: type,
        name: item.name,
        artist: item.artists?.[0]?.name || item.owner?.display_name || 'Various Artists',
        imageUrl: item.images?.[0]?.url
      });
    }
    setIsInLibrary(!isInLibrary); // Optimistically update UI
    if (onToggleLibrary) onToggleLibrary(); // Notify parent if needed
  };

  return (
    <motion.div
      key={item.id}
      className={type === 'album' ? "music-card" : "playlist-card"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <img 
        src={item.images?.[0]?.url || '/album-thumb.png'} 
        alt={item.name} 
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <h3>{item.name}</h3>
      <p>{type === 'album' ? item.artists?.[0]?.name : (item.description || `By ${item.owner?.display_name}`)}</p>
      
      {/* Library Toggle Button */}
      <button 
        onClick={handleToggleLibrary} 
        className="library-toggle-btn" 
        aria-label={isInLibrary ? "Remove from library" : "Add to library"}
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
        {isInLibrary 
          ? <FaHeart color="#1DB954" size={18} /> 
          : <FaRegHeart color="white" size={18} />}
      </button>
    </motion.div>
  );
};

const Home = () => {
  const { setCurrentTrack } = usePlayer();

  const { data: newReleases, isLoading: isLoadingReleases, error: errorReleases } = useQuery({
    queryKey: ['newReleases'],
    queryFn: getNewReleases
  });

  const { data: featured, isLoading: isLoadingFeatured, error: errorFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedPlaylists
  });

  const handleItemClick = useCallback((item) => {
    setCurrentTrack({
      name: item.name,
      artist: item.artists?.[0]?.name || item.owner?.display_name || 'Various Artists',
      imageUrl: item.images?.[0]?.url
    });
  }, [setCurrentTrack]);

  if (isLoadingReleases || isLoadingFeatured) {
    return <div className="loading">Loading...</div>;
  }

  if (errorReleases || errorFeatured) {
    return <div className="error">Error loading data. Please ensure API credentials are correct.</div>;
  }

  return (
    <div className="home-page">
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <h1>Discover New Music</h1>
          <p>Listen to the latest tracks and albums</p>
        </div>
      </motion.section>

      <section className="new-releases">
        <h2>New Releases</h2>
        <div className="music-grid">
          {newReleases?.data?.albums?.items?.map((album) => (
            <LibraryItemCard 
              key={album.id} 
              item={album} 
              type="album" 
              onClick={handleItemClick}
            />
          ))}
        </div>
      </section>

      <section className="featured">
        <h2>Featured Playlists</h2>
        <div className="playlist-grid">
          {featured?.data?.playlists?.items?.map((playlist) => (
            <LibraryItemCard 
              key={playlist.id} 
              item={playlist} 
              type="playlist" 
              onClick={handleItemClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 