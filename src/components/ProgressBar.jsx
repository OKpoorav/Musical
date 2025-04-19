import React, { useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import './ProgressBar.css'; // Add CSS import

// Helper to format seconds into mm:ss
const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const ProgressBar = () => {
  const { currentTime, duration, seekToTime } = usePlayer();

  const handleProgressChange = useCallback((e) => {
    const newTime = Number(e.target.value);
    seekToTime(newTime);
  }, [seekToTime]);

  return (
    <div className="progress-bar-container">
      <span className="time current-time">{formatTime(currentTime)}</span>
      <input
        type="range"
        className="progress-bar"
        min="0"
        max={duration || 0}
        value={currentTime || 0}
        onChange={handleProgressChange}
        aria-label="Track progress"
        // Disable if duration is 0 (or very short)
        disabled={!duration || duration < 1} 
      />
      <span className="time duration">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar; 