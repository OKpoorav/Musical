import React from 'react';
import YouTube from 'react-youtube';
import { usePlayer } from '../context/PlayerContext';

const YouTubePlayer = () => {
  const { youtubeVideoId, setPlaybackStatus, setPlayerRef } = usePlayer();

  const playerOptions = {
    height: '0', // Make player invisible
    width: '0',  // Make player invisible
    playerVars: {
      autoplay: 1, // Autoplay the video when loaded
      controls: 0, // Hide player controls
      showinfo: 0, // Hide video title, etc.
      modestbranding: 1, // Reduce YouTube logo
      fs: 0, // Disable fullscreen button
      disablekb: 1, // Disable keyboard controls
    },
  };

  // Log when the video ID changes for debugging
  React.useEffect(() => {
    if (youtubeVideoId) {
      console.log('YouTubePlayer component received videoId:', youtubeVideoId);
    } else {
      console.log('YouTubePlayer component received null videoId.');
    }
  }, [youtubeVideoId]);

  const onReady = (event) => {
    console.log('YouTube Player Ready. Instance:', event.target);
    setPlayerRef(event.target); // Store the player instance in the context ref
  }

  const onError = (error) => {
    console.error('YouTube Player Error:', error);
    setPlaybackStatus(false); // Ensure state is set to not playing on error
  }

  const onStateChange = (event) => {
    console.log('YouTube Player State Change:', event.data);
    // Update context based on player state
    if (event.data === 1) { // YT.PlayerState.PLAYING
      setPlaybackStatus(true);
    } else if (event.data === 2 || event.data === 0 || event.data === -1 || event.data === 5) { 
      // PAUSED, ENDED, UNSTARTED, CUED
      setPlaybackStatus(false);
    } // Buffering (3) doesn't change our isPlaying state
  }

  // Reset player ref ONLY when videoId changes to null (or component unmounts)
  React.useEffect(() => {
    return () => {
      // Only clear the ref if the component is truly unmounting
      // or perhaps if videoId becomes null explicitly.
      // Let's primarily rely on onReady to set the new ref when videoId changes.
      // console.log("Cleanup: Potentially clearing player ref");
      // setPlayerRef(null); // Re-evaluating if this is needed here
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run cleanup only on unmount now

  // Log when videoId changes (keep this)
  React.useEffect(() => {
    if (youtubeVideoId) {
      console.log('YouTubePlayer: Video ID changed to:', youtubeVideoId);
    } else {
      console.log('YouTubePlayer: Video ID changed to null.');
      // Explicitly clear ref if videoId goes null (e.g., stop button)
      setPlayerRef(null);
    }
  }, [youtubeVideoId, setPlayerRef]);

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      {youtubeVideoId && (
        <YouTube
          videoId={youtubeVideoId}
          opts={playerOptions}
          onReady={onReady}
          onError={onError}
          onStateChange={onStateChange}
        />
      )}
    </div>
  );
};

export default YouTubePlayer; 