import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '../services/spotify';
import { BiSearch } from 'react-icons/bi';
import { usePlayer } from '../context/PlayerContext';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setCurrentTrack } = usePlayer();

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => search(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  const handleTrackClick = (track) => {
    setCurrentTrack({
      name: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      imageUrl: track.album?.images?.[0]?.url
    });
  };

  const handleAlbumClick = (album) => {
    setCurrentTrack({
      name: album.name,
      artist: album.artists?.[0]?.name || 'Unknown Artist',
      imageUrl: album.images?.[0]?.url
    });
  };

  const renderResults = () => {
    if (isLoading) {
      return <div className="loading">Searching...</div>;
    }
    if (error) {
      return <div className="error">Error performing search. Please try again.</div>;
    }
    if (!searchResults?.data || 
        (searchResults.data.tracks?.items?.length === 0 && 
         searchResults.data.artists?.items?.length === 0 && 
         searchResults.data.albums?.items?.length === 0)) {
      return <div className="no-results">No results found for "{searchTerm}".</div>;
    }

    return (
      <>
        {searchResults.data.tracks?.items?.length > 0 && (
          <section className="result-section">
            <h2>Songs</h2>
            <div className="tracks-grid">
              {searchResults.data.tracks.items.map((track) => (
                <motion.div
                  key={track.id}
                  className="track-card"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTrackClick(track)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={track.album?.images?.[0]?.url || '/album-thumb.png'} 
                    alt={track.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
                  />
                  <div className="track-info">
                    <h3>{track.name}</h3>
                    <p>{track.artists?.[0]?.name || 'Unknown Artist'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {searchResults.data.artists?.items?.length > 0 && (
          <section className="result-section">
            <h2>Artists</h2>
            <div className="artists-grid">
              {searchResults.data.artists.items.map((artist) => (
                <motion.div
                  key={artist.id}
                  className="artist-card"
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src={artist.images?.[0]?.url || '/default-artist.png'} 
                    alt={artist.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src='/default-artist.png'}}
                    className="artist-image"
                  />
                  <h3>{artist.name}</h3>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {searchResults.data.albums?.items?.length > 0 && (
          <section className="result-section">
            <h2>Albums</h2>
            <div className="albums-grid">
              {searchResults.data.albums.items.map((album) => (
                <motion.div
                  key={album.id}
                  className="album-card"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAlbumClick(album)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={album.images?.[0]?.url || '/album-thumb.png'} 
                    alt={album.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
                  />
                  <h3>{album.name}</h3>
                  <p>{album.artists?.[0]?.name || 'Unknown Artist'}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </>
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
        </div>
      </div>

      <AnimatePresence>
        {searchTerm.length > 2 && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderResults()} 
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search; 