import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '../services/spotify';
import { BiSearch } from 'react-icons/bi';
import { usePlayer } from '../context/PlayerContext';
import { addLibraryItem, removeLibraryItem, isItemInLibrary } from '../services/localLibrary';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

// Card component for Search results (Tracks and Albums)
const SearchResultCard = ({ item, type, onClick, onToggleLibrary }) => {
  const [isInLibrary, setIsInLibrary] = useState(false);

  useEffect(() => {
    setIsInLibrary(isItemInLibrary(item.id, type));
  }, [item.id, type]);

  const handleToggleLibrary = useCallback((e) => {
    e.stopPropagation();
    const libraryItem = {
      id: item.id,
      type: type,
      name: item.name,
      artist: type === 'track' ? item.artists?.[0]?.name || 'Unknown Artist' : item.artists?.[0]?.name || 'Various Artists',
      imageUrl: type === 'track' ? item.album?.images?.[0]?.url : item.images?.[0]?.url,
    };

    if (isInLibrary) {
      removeLibraryItem(item.id, type);
    } else {
      addLibraryItem(libraryItem);
    }
    setIsInLibrary(prev => !prev); // Use functional update
    if (onToggleLibrary) onToggleLibrary();
  }, [isInLibrary, item, type, onToggleLibrary]);

  const imageUrl = (type === 'track' ? item.album?.images?.[0]?.url : item.images?.[0]?.url) || '/album-thumb.png';
  const artistName = item.artists?.[0]?.name || (type === 'track' ? 'Unknown Artist' : 'Various Artists');

  return (
    <motion.div
      className={`search-result-card ${type}-card`}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} // Subtle hover effect
      onClick={() => onClick(item)}
      style={{ position: 'relative' }}
      layout // Enable animation on layout changes
    >
      <img 
        src={imageUrl} 
        alt={item.name} 
        className="search-card-image"
        onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
      />
      <div className="search-card-info">
        <h3 title={item.name}>{item.name}</h3>
        <p title={artistName}>{artistName}</p>
      </div>
      <button 
        onClick={handleToggleLibrary} 
        className="library-toggle-btn search-card-toggle"
        aria-label={isInLibrary ? "Remove from library" : "Add to library"}
      >
        {isInLibrary 
          ? <FaHeart color="#1DB954" size={18} /> 
          : <FaRegHeart color="white" size={18} />}
      </button>
    </motion.div>
  );
};

// Simple Artist card (no library interaction)
const ArtistCard = ({ artist }) => {
  const imageUrl = artist.images?.[0]?.url || '/default-artist.png';
  return (
    <motion.div
      className="search-result-card artist-card"
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      layout
    >
      <img 
        src={imageUrl} 
        alt={artist.name} 
        className="search-card-image artist-image"
        onError={(e) => { e.target.onerror = null; e.target.src='/default-artist.png'}}
      />
      <div className="search-card-info">
        <h3 title={artist.name}>{artist.name}</h3>
        <p>Artist</p>
      </div>
    </motion.div>
  );
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setCurrentTrack } = usePlayer();

  const { data: searchResults, isLoading, error, isFetching } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => search(searchTerm),
    enabled: searchTerm.trim().length > 2, // Trim whitespace and check length
    staleTime: 1000 * 60 * 5,
  });

  const handleTrackClick = useCallback((track) => {
    setCurrentTrack({
      name: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      imageUrl: track.album?.images?.[0]?.url
    });
  }, [setCurrentTrack]);

  const handleAlbumClick = useCallback((album) => {
    setCurrentTrack({
      name: album.name,
      artist: album.artists?.[0]?.name || 'Unknown Artist',
      imageUrl: album.images?.[0]?.url
    });
  }, [setCurrentTrack]);

  const renderResults = () => {
    // Use `isFetching` for a subtle loading indicator during background refetches
    // `isLoading` is only true for the initial load
    if (isLoading) return <div className="loading">Searching...</div>;
    if (error) return <div className="error">Error performing search. Please try again.</div>;
    
    const tracks = searchResults?.data?.tracks?.items || [];
    const artists = searchResults?.data?.artists?.items || [];
    const albums = searchResults?.data?.albums?.items || [];

    if (tracks.length === 0 && artists.length === 0 && albums.length === 0) {
      return <div className="no-results">No results found for "{searchTerm}".</div>;
    }

    return (
      <div className="search-results-container"> {/* New container */}      
        {tracks.length > 0 && (
          <section className="result-section">
            <h2>Songs</h2>
            <div className="search-grid">
              {tracks.map((track) => (
                <SearchResultCard 
                  key={track.id} 
                  item={track} 
                  type="track" 
                  onClick={handleTrackClick}
                />
              ))}
            </div>
          </section>
        )}

        {artists.length > 0 && (
          <section className="result-section">
            <h2>Artists</h2>
            <div className="search-grid">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section className="result-section">
            <h2>Albums</h2>
            <div className="search-grid">
              {albums.map((album) => (
                 <SearchResultCard 
                   key={album.id} 
                   item={album} 
                   type="album" 
                   onClick={handleAlbumClick}
                 />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-container">
          <BiSearch size={24} />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search Input"
          />
          {isFetching && <div className="search-fetching-indicator"></div>} {/* Subtle indicator */}
        </div>
      </div>

      <AnimatePresence mode="wait"> {/* Use mode=wait for smoother transitions */}
        {searchTerm.trim().length > 2 && (
          <motion.div
            key={searchTerm} // Add key for smooth animation on search term change
            className="search-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderResults()} 
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search; 