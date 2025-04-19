import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAlbum } from '../services/spotify';
import './AlbumPage.css';

// Helper to format milliseconds to mm:ss (same as TrackPage)
const formatDuration = (ms) => {
  if (!ms) return '--:--';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

const AlbumPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch album data
  const { data: albumData, isLoading, error } = useQuery({
    queryKey: ['album', id],
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="loading">Loading album details...</div>;
  }

  if (error) {
    console.error("Album page loading error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Error loading album.";
    return <div className="error">{errorMessage} Please try again later.</div>;
  }

  // Extract album details
  const album = albumData?.data;
  const imageUrl = album?.images?.[0]?.url || '/album-thumb.png';
  const albumName = album?.name || 'Album Name Unavailable';
  const artistNames = album?.artists?.map(artist => artist.name).join(', ') || 'Artist Unavailable';
  const releaseDate = album?.release_date || 'Release Date Unavailable';
  const totalTracks = album?.total_tracks || 0;
  const tracks = album?.tracks?.items || [];

  // Click handler for track list item
  const handleTrackItemClick = (trackId) => {
    if (!trackId) return;
    navigate(`/track/${trackId}`);
  };

  return (
    <div className="album-page detail-page">
      <div className="detail-header">
        <img 
          src={imageUrl} 
          alt={albumName} 
          className="detail-image large-image" 
          onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
        />
        <div className="detail-info">
          <h1>{albumName}</h1>
          <h2>{artistNames}</h2>
          <p>{releaseDate} &bull; {totalTracks} tracks</p>
          {/* TODO: Add Play/Shuffle Button? Add to Library? */}
        </div>
      </div>

      <div className="track-list-container">
        <h3>Tracks</h3>
        <ul className="track-list">
          {tracks.map((track, index) => (
            <li 
              key={track.id || index} 
              className="track-list-item track-list-item-clickable" 
              onClick={() => handleTrackItemClick(track.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTrackItemClick(track.id); }}
            >
              <span className="track-number">{index + 1}</span>
              <div className="track-item-info">
                <span className="track-name">{track.name}</span>
                <span className="track-artists">{track.artists?.map(a => a.name).join(', ')}</span>
              </div>
              {/* TODO: Add play button per track */}
              <span className="track-duration">{formatDuration(track.duration_ms)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlbumPage; 