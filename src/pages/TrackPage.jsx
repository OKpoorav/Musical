import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrack } from '../services/spotify'; // Import API function
import { usePlayer } from '../context/PlayerContext'; // Import usePlayer
import { BsPlayCircleFill } from 'react-icons/bs'; // Use a different play icon
import './TrackPage.css'; // Add CSS import

// Helper to format milliseconds to mm:ss
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

const TrackPage = () => {
  const { id } = useParams();
  const { playTrack } = usePlayer(); // Get playTrack function from context

  // Fetch track data
  const { data: trackData, isLoading, error } = useQuery({
    queryKey: ['track', id], // Unique query key
    queryFn: () => getTrack(id), // Call API function
    enabled: !!id, // Only run query if ID exists
  });

  if (isLoading) {
    return <div className="loading">Loading track details...</div>;
  }

  if (error) {
    console.error("Track page loading error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Error loading track.";
    return <div className="error">{errorMessage} Please try again later.</div>;
  }

  // Extract track details (handle potential missing data)
  const track = trackData?.data;
  const imageUrl = track?.album?.images?.[0]?.url || '/album-thumb.png';
  const trackName = track?.name || 'Track Name Unavailable';
  const artists = track?.artists || [];
  const albumName = track?.album?.name || 'Album Name Unavailable';
  const albumId = track?.album?.id; // Get album ID for linking
  const duration = track?.duration_ms ? formatDuration(track.duration_ms) : '--:--';
  const popularity = track?.popularity; // Get popularity

  const handlePlayClick = () => {
    if (!track) return; // Don't play if track data isn't loaded
    
    playTrack({
      name: track.name,
      // Pass the primary artist name for the YT search
      artist: artists?.[0]?.name || '', 
      imageUrl: imageUrl // Pass image for the display bar
    });
  };

  return (
    <div className="track-page detail-page">
      {/* Central content container */}
      <div className="track-page-content">
        
        {/* Image */}
        <img 
          src={imageUrl} 
          alt={albumName} 
          className="detail-image track-image" 
          onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
        />
        
        {/* Info Section */}
        <div className="track-info-main">
            <h1>{trackName}</h1>
            {/* Link artists */}          
            <div className="track-artists-links">
                {artists.map((artist, index) => (
                  <React.Fragment key={artist.id}>
                    <Link to={`/artist/${artist.id}`} className="artist-link">{artist.name}</Link>
                    {index < artists.length - 1 && <span>, </span>} 
                  </React.Fragment>
                ))}
                {artists.length === 0 && 'Artist Unavailable'}
            </div>
            {/* Link to album */}          
            <p className="track-album-info">
                Album: {albumId ? <Link to={`/album/${albumId}`} className="album-link">{albumName}</Link> : albumName}
            </p>
        </div>

        {/* Play Button - Larger and centered */}
        <button onClick={handlePlayClick} className="play-button large-play-button" aria-label="Play Track">
            <BsPlayCircleFill size={50} /> Play
        </button>

        {/* Additional Details */}
        <div className="track-extra-details">
            {duration !== '--:--' && <p>Duration: {duration}</p>}
            {popularity !== undefined && <p>Popularity: {popularity}/100</p>}
            {/* Add more details like release date? track.album.release_date */} 
        </div>
        
      </div>
    </div>
  );
};

export default TrackPage; 