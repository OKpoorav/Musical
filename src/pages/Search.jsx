import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '../services/spotify';
import { BiSearch } from 'react-icons/bi';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => search(searchTerm),
    enabled: searchTerm.length > 0
  });

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
          />
        </div>
      </div>

      <AnimatePresence>
        {searchTerm && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {isLoading ? (
              <div className="loading">Searching...</div>
            ) : (
              <>
                <section className="result-section">
                  <h2>Songs</h2>
                  <div className="tracks-grid">
                    {searchResults?.data?.tracks?.items?.map((track) => (
                      <motion.div
                        key={track.id}
                        className="track-card"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={track.album.images[0].url} alt={track.name} />
                        <div className="track-info">
                          <h3>{track.name}</h3>
                          <p>{track.artists[0].name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section className="result-section">
                  <h2>Artists</h2>
                  <div className="artists-grid">
                    {searchResults?.data?.artists?.items?.map((artist) => (
                      <motion.div
                        key={artist.id}
                        className="artist-card"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img 
                          src={artist.images[0]?.url || '/default-artist.png'} 
                          alt={artist.name} 
                        />
                        <h3>{artist.name}</h3>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section className="result-section">
                  <h2>Albums</h2>
                  <div className="albums-grid">
                    {searchResults?.data?.albums?.items?.map((album) => (
                      <motion.div
                        key={album.id}
                        className="album-card"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={album.images[0].url} alt={album.name} />
                        <h3>{album.name}</h3>
                        <p>{album.artists[0].name}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search; 