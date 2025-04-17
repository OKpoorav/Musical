import React from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';

const Library = () => {
  return (
    <div className="library-page">
      <motion.div 
        className="message-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '4rem auto',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px'
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Library Access Limited</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          This version of the application uses Spotify's Client Credentials flow, 
          which only allows access to public data. Personal library features 
          like playlists and liked songs require user authentication, which is 
          not implemented in this version.
        </p>
        <p style={{ marginTop: '1rem', color: '#1DB954' }}>
          Try using the Home or Search features to explore public music content!
        </p>
      </motion.div>
    </div>
  );
};

export default Library; 