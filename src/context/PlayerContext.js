import React, { createContext, useState, useContext, useMemo, useRef, useCallback } from 'react';
import { searchYouTubeVideo } from '../services/youtube'; // Import the YouTube search function

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState({
    name: 'Nothing Playing',
    artist: '--',
    imageUrl: null,
  });
  const [youtubeVideoId, setYoutubeVideoId] = useState(null); // State for YouTube video ID
  const [isPlaying, setIsPlaying] = useState(false); // State for playback status
  const [duration, setDuration] = useState(0); // Track duration in seconds
  const [currentTime, setCurrentTime] = useState(0); // Current playback time in seconds
  const [volume, setVolumeState] = useState(50); // Volume state (0-100)

  const playerRef = useRef(null); // Ref to store the YouTube player instance
  const progressIntervalRef = useRef(null); // Ref to store interval ID

  // Clear interval on unmount
  React.useEffect(() => {
      return () => {
          if (progressIntervalRef.current) {
              console.log("Clearing progress interval on unmount");
              clearInterval(progressIntervalRef.current);
          }
      };
  }, []);

  const playTrack = useCallback(async (trackInfo) => {
    const timestamp = Date.now(); // Get timestamp for logging
    console.log(`[${timestamp}] playTrack called with:`, trackInfo);
    if (!trackInfo || !trackInfo.name) { 
        console.error(`[${timestamp}] playTrack: Invalid trackInfo`);
        setCurrentTrack({ name: 'Nothing Playing', artist: '--', imageUrl: null });
        setYoutubeVideoId(null);
        setIsPlaying(false);
        setDuration(0); 
        setCurrentTime(0); 
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        return; 
    }

    // Reset state before new track load
    console.log(`[${timestamp}] playTrack: Resetting state START`);
    setCurrentTrack({
        name: trackInfo.name || 'Unknown Track',
        artist: trackInfo.artist || 'Unknown Artist',
        imageUrl: trackInfo.imageUrl || null,
    });
    setYoutubeVideoId(null);
    console.log(`[${timestamp}] playTrack: Set youtubeVideoId to null`);
    setIsPlaying(false); 
    setDuration(0); 
    setCurrentTime(0); 
    if (progressIntervalRef.current) {
      console.log(`[${timestamp}] playTrack: Clearing progress interval ${progressIntervalRef.current}`);
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    console.log(`[${timestamp}] playTrack: Resetting state END`);

    console.log(`[${timestamp}] playTrack: Searching YouTube START...`);
    const query = `${trackInfo.name} ${trackInfo.artist || ''}`.trim();
    try {
      const videoId = await searchYouTubeVideo(query);
      console.log(`[${timestamp}] playTrack: Searching YouTube END. Result: ${videoId}`);

      if (videoId) {
          console.log(`[${timestamp}] playTrack: YouTube search successful, setting video ID START`);
          setYoutubeVideoId(videoId); 
          console.log(`[${timestamp}] playTrack: YouTube search successful, setting video ID END`);
      } else {
          console.warn(`[${timestamp}] playTrack: YouTube search failed`);
      }
    } catch (searchError) {
        console.error(`[${timestamp}] playTrack: YouTube search encountered an error:`, searchError);
        // Optionally handle the UI state in case of search error
    }
  }, []); // Empty dependency array as it doesn't depend on component state directly

  const setPlaybackStatus = useCallback((playing) => {
    console.log(`setPlaybackStatus called with: ${playing}`);
    setIsPlaying(playing);
    
    if (playing) {
      console.log("Attempting to start progress interval...");
      if (progressIntervalRef.current) {
          console.log("Clearing existing interval before starting new one");
          clearInterval(progressIntervalRef.current);
      } 
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time || 0);
        } 
      }, 500); 
      console.log("Progress interval STARTED with ID:", progressIntervalRef.current);
    } else {
      console.log("Attempting to clear progress interval...");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        console.log("Progress interval CLEARED");
      } else {
         console.log("No active interval to clear.");
      }
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
         const finalTime = playerRef.current.getCurrentTime();
         console.log("Setting final time on pause/end:", finalTime);
         setCurrentTime(finalTime || 0);
      }
    }
  }, []); // No external state dependencies for this logic

  const setPlayerRef = useCallback((playerInstance) => {
    console.log("setPlayerRef called with instance:", playerInstance);
    playerRef.current = playerInstance;
    if (playerInstance && typeof playerInstance.getDuration === 'function') { 
        const trackDuration = playerInstance.getDuration();
        console.log("setPlayerRef: Player Ready. Duration:", trackDuration);
        setDuration(trackDuration || 0);
        if (typeof playerInstance.setVolume === 'function') {
            playerInstance.setVolume(volume); // Use volume state here
            console.log("setPlayerRef: Initial volume set to:", volume);
        } 
    } else if (!playerInstance) {
        console.log("setPlayerRef: Player instance is null, clearing state.");
        setDuration(0);
        setCurrentTime(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    } else {
         console.warn("setPlayerRef: Player instance ready, but getDuration not available?");
    }
  }, [volume]); // Depends on volume state for initial setting

  const togglePlayPause = useCallback(() => {
    const player = playerRef.current;
    console.log("togglePlayPause called. Player Ref:", player);

    // Add check for youtubeVideoId
    if (!youtubeVideoId) {
      console.warn("togglePlayPause: No videoId set, cannot play/pause.");
      return; 
    }

    if (!player || typeof player.getPlayerState !== 'function') {
      console.warn("Player instance or getPlayerState not available.");
      return;
    }
    const playerState = player.getPlayerState();
    console.log("Current Player State:", playerState);
    if (playerState === 1) { // YT.PlayerState.PLAYING
      console.log("Calling pauseVideo()");
      player.pauseVideo();
    } else {
      console.log("Calling playVideo()");
      player.playVideo();
    }
  }, [youtubeVideoId]); // Add youtubeVideoId to dependency array

  const seekToTime = useCallback((seconds) => {
    const player = playerRef.current;
    console.log(`seekToTime called with: ${seconds}. Player Ref:`, player);
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(seconds, true); 
      setCurrentTime(seconds); 
    } else {
      console.warn("Player instance not available for seeking.");
    }
  }, []); // Doesn't depend on component state

  const setVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, Number(newVolume))); 
    console.log(`setVolume called with: ${newVolume} (clamped: ${clampedVolume})`);
    setVolumeState(clampedVolume);
    const player = playerRef.current;
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(clampedVolume);
    } 
  }, []); // Doesn't depend on component state

  const value = useMemo(() => ({
    currentTrack, 
    youtubeVideoId, 
    isPlaying, 
    duration, 
    currentTime, 
    volume, 
    playTrack,
    setPlaybackStatus, 
    setPlayerRef,
    togglePlayPause, 
    seekToTime, 
    setVolume 
  }), [currentTrack, youtubeVideoId, isPlaying, duration, currentTime, volume, 
       playTrack, setPlaybackStatus, setPlayerRef, togglePlayPause, seekToTime, setVolume]); // Add useCallback functions

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext); 