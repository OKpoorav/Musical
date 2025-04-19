import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { search } from '../services/spotify';
import { BiSearch } from 'react-icons/bi';
import { LibraryItemCard } from './Home';
import './SearchPage.css';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Simple Artist card - Now navigates
const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();
  const imageUrl = artist.images?.[0]?.url || '/default-artist.png'; // TODO: Replace with a better placeholder

  const handleNavigate = () => {
    navigate(`/artist/${artist.id}`);
  };

  return (
    <motion.div
      className="search-result-card artist-card home-card" // Add home-card class for potential style reuse
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      style={{ cursor: 'pointer' }} // Add pointer cursor
      onClick={handleNavigate} // Add navigation handler
      layout
    >
      <img 
        src={imageUrl} 
        alt={artist.name} 
        className="search-card-image artist-image home-card-image" // Add home-card-image class
        onError={(e) => { e.target.onerror = null; e.target.src='/default-artist.png'}} // TODO: Placeholder
      />
      <div className="search-card-info home-card-info"> {/* Add home-card-info class */}
        <h3 title={artist.name}>{artist.name}</h3>
        <p>Artist</p>
      </div>
    </motion.div>
  );
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search term by 500ms

  const { data: searchResults, isLoading, error, isFetching } = useQuery({
    queryKey: ['search', debouncedSearchTerm], // Use debounced term
    queryFn: () => search(debouncedSearchTerm),
    // Only run query if debounced term is long enough
    enabled: debouncedSearchTerm.trim().length > 2, 
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Keep showing old results while new ones load
  });

  const renderResults = () => {
    // Use `isLoading` for initial load, `isFetching` for subsequent loads
    if (isLoading && !searchResults) return <div className="loading">Searching...</div>;
    // Don't show error if we are keeping previous data and just fetching fails
    if (error && !isFetching && !searchResults) return <div className="error">Error performing search. Please try again.</div>;
    
    const tracks = searchResults?.data?.tracks?.items || [];
    const artists = searchResults?.data?.artists?.items || [];
    const albums = searchResults?.data?.albums?.items || [];

    const noResultsFound = tracks.length === 0 && artists.length === 0 && albums.length === 0;
    const hasSearchTerm = debouncedSearchTerm.trim().length > 2;

    // Show no results message only if searching and nothing found
    if (!isFetching && hasSearchTerm && noResultsFound) {
      return <div className="no-results">No results found for "{debouncedSearchTerm}".</div>;
    }

    // Show initial placeholder if not searching and not fetching
    if (!isFetching && !hasSearchTerm) {
        return <div className="no-results search-placeholder">Search for songs, artists, or albums.</div>; 
    }
    
    // If fetching or has results, render the sections
    if (isFetching || !noResultsFound) {
      return (
        <div className="search-results-container">
         {/* Only render sections if not initial loading OR if there are results */}
         { (isFetching || tracks.length > 0) && (
            <section className="result-section">
              <h2>Songs</h2>
              <div className="search-grid home-grid responsive-grid"> {/* Add responsive-grid class */}
                {tracks.map((track) => (
                  <LibraryItemCard 
                    key={track.id} 
                    item={{ // Adapt item structure for LibraryItemCard if needed
                      ...track,
                      images: track.album?.images // Tracks use album images
                    }}
                    type="track" 
                    // onClick is handled internally by LibraryItemCard for navigation
                    // onToggleLibrary can be added if needed for search results
                  />
                ))}
              </div>
            </section>
          )}
          { (isFetching || artists.length > 0) && (
            <section className="result-section">
              <h2>Artists</h2>
              <div className="search-grid home-grid responsive-grid"> {/* Add responsive-grid class */}
                {artists.map((artist) => (
                  // ArtistCard kept for now, potentially replace later
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}
          { (isFetching || albums.length > 0) && (
            <section className="result-section">
              <h2>Albums</h2>
              <div className="search-grid home-grid responsive-grid"> {/* Add responsive-grid class */}
                {albums.map((album) => (
                   <LibraryItemCard 
                     key={album.id} 
                     item={album} // Album structure should match LibraryItemCard expectation
                     type="album" 
                     // onClick is handled internally by LibraryItemCard for navigation
                   />
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    // Fallback if none of the above conditions met (should be rare)
    return null; 
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-container">
          <BiSearch size={24} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search Input"
          />
          {/* Use isFetching for the indicator */}
          {isFetching && <div className="search-fetching-indicator"></div>}
        </div>
      </div>

      <AnimatePresence mode="wait">
         {/* Always render the motion.div container, let renderResults handle content */}
          <motion.div
            key={debouncedSearchTerm || 'initial'} // Key changes when search starts/stops
            className="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderResults()} 
          </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Search; 