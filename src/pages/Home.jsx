import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNewReleases, getBrowseCategories } from '../services/spotify';
import { usePlayer } from '../context/PlayerContext';
import { addLibraryItem, removeLibraryItem, isItemInLibrary } from '../services/localLibrary';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Heart icons
import { BsGrid3X3GapFill } from 'react-icons/bs'; // Placeholder icon for categories

// Component for individual album/playlist cards
const LibraryItemCard = ({ item, type, onClick, onToggleLibrary }) => {
  const [isInLibrary, setIsInLibrary] = useState(false);

  useEffect(() => {
    setIsInLibrary(isItemInLibrary(item.id, type));
  }, [item.id, type]);

  const handleToggleLibrary = useCallback((e) => {
    e.stopPropagation(); // Prevent card click when clicking the heart
    const libraryItem = {
        id: item.id,
        type: type,
        name: item.name,
        artist: item.artists?.[0]?.name || 'Various Artists',
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

  return (
    <motion.div
      key={item.id}
      className={`home-card ${type}-card`}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      onClick={() => onClick(item)}
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
        <p title={item.artists?.[0]?.name}>{item.artists?.[0]?.name}</p>
      </div>
      
      {/* Library Toggle Button */}
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

// Category Card (No longer a Link)
const CategoryCard = ({ category }) => {
  return (
    <motion.div
      key={category.id}
      className="category-card home-card"
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      style={{ cursor: 'default' }}
      layout
    >
      {category.icons?.[0]?.url ? (
        <img 
          src={category.icons[0].url}
          alt={category.name}
          className="home-card-image category-image"
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="home-card-image category-icon-placeholder">
          <BsGrid3X3GapFill size={40} color="var(--text-subdued)" />
        </div>
      )}
      <div className="home-card-info">
        <h3 title={category.name}>{category.name}</h3>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { setCurrentTrack } = usePlayer();

  const { data: newReleasesData, isLoading: isLoadingReleases, error: errorReleases } = useQuery({
    queryKey: ['newReleases'],
    queryFn: getNewReleases
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: errorCategories } = useQuery({
    queryKey: ['browseCategories'],
    queryFn: getBrowseCategories
  });

  const handleAlbumClick = useCallback((album) => {
    setCurrentTrack({
      name: album.name,
      artist: album.artists?.[0]?.name || 'Various Artists',
      imageUrl: album.images?.[0]?.url
    });
  }, [setCurrentTrack]);

  const isLoading = isLoadingReleases || isLoadingCategories;
  const error = errorReleases || errorCategories;

  const categories = categoriesData?.data?.categories?.items || [];
  const newReleaseAlbums = newReleasesData?.data?.albums?.items || [];

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
          <p>Explore new releases and browse categories</p>
        </div>
      </motion.section>

      <section className="home-section new-releases">
        <h2>New Releases</h2>
        <div className="home-grid">
          {newReleaseAlbums.map((album) => (
            <LibraryItemCard 
              key={album.id} 
              item={album} 
              type="album" 
              onClick={handleAlbumClick}
            />
          ))}
        </div>
      </section>

      <section className="home-section browse-categories">
        <h2>Browse Categories</h2>
        <div className="home-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 