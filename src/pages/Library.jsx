import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getUserPlaylists, getUserSavedTracks } from '../services/spotify';

const Library = () => {
  const { data: playlists } = useQuery({
    queryKey: ['userPlaylists'],
    queryFn: getUserPlaylists
  });

  const { data: savedTracks } = useQuery({
    queryKey: ['userSavedTracks'],
    queryFn: getUserSavedTracks
  });

  return (
    <div className="library-page">
      <section className="playlists-section">
        <h2>Your Playlists</h2>
        <div className="playlists-grid">
          {playlists?.data?.items?.map((playlist) => (
            <motion.div
              key={playlist.id}
              className="playlist-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={playlist.images[0]?.url || '/default-playlist.png'} 
                alt={playlist.name} 
              />
              <h3>{playlist.name}</h3>
              <p>{playlist.tracks.total} tracks</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="saved-tracks-section">
        <h2>Liked Songs</h2>
        <div className="tracks-grid">
          {savedTracks?.data?.items?.map((item) => (
            <motion.div
              key={item.track.id}
              className="track-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={item.track.album.images[0].url} alt={item.track.name} />
              <div className="track-info">
                <h3>{item.track.name}</h3>
                <p>{item.track.artists[0].name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Library; 