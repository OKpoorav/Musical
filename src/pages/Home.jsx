import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNewReleases, getFeaturedPlaylists } from '../services/spotify';

const Home = () => {
  const { data: newReleases } = useQuery({
    queryKey: ['newReleases'],
    queryFn: getNewReleases
  });

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedPlaylists
  });

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
            >
              <img src={album.images[0].url} alt={album.name} />
              <h3>{album.name}</h3>
              <p>{album.artists[0].name}</p>
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
            >
              <img src={playlist.images[0].url} alt={playlist.name} />
              <h3>{playlist.name}</h3>
              <p>{playlist.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 