import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { BsVolumeUp, BsVolumeMute } from 'react-icons/bs'; // Import icons
import './VolumeControl.css'; // Create a CSS file for specific styles if needed

const VolumeControl = () => {
    const { volume, setVolume } = usePlayer();
    
    const handleVolumeChange = (e) => {
      setVolume(e.target.value);
    };

    // Optional: Add mute toggle functionality later
    // const handleMuteToggle = () => {
    //     if (volume === 0) {
    //         setVolume(50); // Restore to default or previous volume
    //     } else {
    //         setVolume(0);
    //     }
    // };

    const VolumeIcon = volume > 0 ? BsVolumeUp : BsVolumeMute;

    return (
        <div className="volume-controls">
            {/* Mute toggle button (optional) */}
            {/* 
            <button onClick={handleMuteToggle} className="volume-icon-button" aria-label={volume > 0 ? "Mute" : "Unmute"}>
                <VolumeIcon size={20} />
            </button> 
            */}
            {/* Display icon directly for now */}
            <VolumeIcon size={20} /> 
            <input 
                type="range" 
                className="volume-slider" // Add specific class
                min="0" 
                max="100" 
                value={volume} 
                onChange={handleVolumeChange} 
                aria-label="Volume control"
                style={{ background: `linear-gradient(to right, var(--primary-color) ${volume}%, #4d4d4d ${volume}%)` }} // Inline style for fill
            />
        </div>
    );
}

export default VolumeControl; 