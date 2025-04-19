import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getNewReleases } from '../services/spotify';
import { addLibraryItem, removeLibraryItem, isItemInLibrary } from '../services/localLibrary';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Heart icons

// Component for individual album/playlist/track cards
const LibraryItemCard = ({ item, type, onToggleLibrary }) => {
  const [isInLibrary, setIsInLibrary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsInLibrary(isItemInLibrary(item.id, type));
  }, [item.id, type]);

  const handleToggleLibrary = useCallback((e) => {
    e.stopPropagation(); // Prevent card click when clicking the heart
    const libraryItem = {
        id: item.id,
        type: type,
        name: item.name,
        artist: item.artists?.[0]?.name || item.owner?.display_name || 'Various Artists',
        imageUrl: item.images?.[0]?.url
      };

    if (isInLibrary) {
      removeLibraryItem(item.id, type);
    } else {
      addLibraryItem(libraryItem);
    }
    setIsInLibrary(prev => !prev); // Optimistically update UI
    if (onToggleLibrary) onToggleLibrary(); // Notify parent if needed
  }, [isInLibrary, item, type, onToggleLibrary]);

  const handleNavigate = () => {
    if (!type) return;
    navigate(`/${type}/${item.id}`);
  };

  return (
    <motion.div
      key={item.id}
      className={`home-card ${type}-card`}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      onClick={handleNavigate}
      style={{ cursor: 'pointer', position: 'relative' }}
      layout
    >
      <img 
        src={item.images?.[0]?.url || '/album-thumb.png'} 
        alt={item.name} 
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
        className="home-card-image"
      />
      <div className="home-card-info">
        <h3 title={item.name}>{item.name}</h3>
        <p title={item.artists?.[0]?.name || item.owner?.display_name || item.description}>
          {type === 'playlist' 
            ? item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '')
            : item.owner?.display_name
            : item.artists?.[0]?.name}
        </p>
      </div>
      
      <button 
        onClick={handleToggleLibrary} 
        className="library-toggle-btn home-card-toggle" 
        aria-label={isInLibrary ? "Remove from library" : "Add to library"}
      >
        {isInLibrary 
          ? <FaHeart color="#1DB954" size={18} /> 
          : <FaRegHeart color="white" size={18} />}
      </button>
    </motion.div>
  );
};

// Export LibraryItemCard for reuse
export { LibraryItemCard };

const Home = () => {
  // Fetch New Releases
  const { data: newReleasesData, isLoading: isLoadingReleases, error: errorReleases } = useQuery({
    queryKey: ['newReleases'],
    queryFn: getNewReleases
  });

  // Adjust loading and error states
  const isLoading = isLoadingReleases; // Only depends on releases now
  const error = errorReleases;

  const newReleaseAlbumsRaw = newReleasesData?.data?.albums?.items || []; 

  // Filter albums to include only those with primarily English/common characters in the name
  const allowedCharsRegex = /^[a-zA-Z0-9\s\-_'!?.,()&:;]+$/;
  const newReleaseAlbums = newReleaseAlbumsRaw.filter(album => 
    album.name && allowedCharsRegex.test(album.name)
  );

  if (isLoading) {
    return <div className="loading">Loading Home...</div>;
  }

  if (error) {
    console.error("Home page loading error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Error loading data.";
    return <div className="error">{errorMessage} Please try again later.</div>;
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
          <p>Explore the latest releases</p>
        </div>
      </motion.section>

      <section className="home-section new-releases">
        <h2>New Releases</h2>
        <div className="home-grid responsive-grid">
          {newReleaseAlbums.map((album) => (
            <LibraryItemCard 
              key={album.id} 
              item={album} 
              type="album"
            />
          ))}
          {!isLoading && newReleaseAlbums.length === 0 && newReleaseAlbumsRaw.length > 0 && (
            <p>Some releases were hidden due to incompatible characters.</p>
          )}
          {!isLoading && newReleaseAlbumsRaw.length === 0 && (
            <p>No new releases found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 