import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNewReleases, getFeaturedPlaylists } from '../services/spotify';
import { usePlayer } from '../context/PlayerContext';

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

  const handleItemClick = (item) => {
    setCurrentTrack({
      name: item.name,
      artist: item.artists?.[0]?.name || item.owner?.display_name || 'Various Artists',
      imageUrl: item.images?.[0]?.url
    });
  };

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
            <motion.div
              key={album.id}
              className="music-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(album)}
              style={{ cursor: 'pointer' }}
            >
              <img src={album.images?.[0]?.url || '/album-thumb.png'} alt={album.name} onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}/>
              <h3>{album.name}</h3>
              <p>{album.artists?.[0]?.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="featured">
        <h2>Featured Playlists</h2>
        <div className="playlist-grid">
          {featured?.data?.playlists?.items?.map((playlist) => (
            <motion.div
              key={playlist.id}
              className="playlist-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(playlist)}
              style={{ cursor: 'pointer' }}
            >
              <img src={playlist.images?.[0]?.url || '/album-thumb.png'} alt={playlist.name} onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}/>
              <h3>{playlist.name}</h3>
              <p>{playlist.description || `By ${playlist.owner?.display_name}`}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 