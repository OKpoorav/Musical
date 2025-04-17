import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState({
    name: 'Select a track',        // Default name
    artist: '-',                 // Default artist
    imageUrl: null // Initialize imageUrl to null
  });

  const setCurrentTrack = (trackDetails) => {
    // Ensure trackDetails has the expected structure
    const newTrack = {
        name: trackDetails?.name || 'Unknown Track',
        artist: trackDetails?.artist || 'Unknown Artist',
        imageUrl: trackDetails?.imageUrl || null // Default to null if no image
    };
    setCurrentTrackState(newTrack);
    // console.log("Setting current track:", newTrack); // For debugging
  };

  const value = {
    currentTrack,
    setCurrentTrack,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}; 