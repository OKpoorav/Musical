import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArtist, getArtistTopTracks, getArtistAlbums } from '../services/spotify';
import { LibraryItemCard } from './Home'; // Reuse card for albums
import './ArtistPage.css'; // Add CSS import

// Helper to format milliseconds to mm:ss (can be moved to a utils file)
const formatDuration = (ms) => {
  if (!ms) return '--:--';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

// Helper to format large numbers (for followers)
const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ArtistPage = () => {
  const { id } = useParams();

  // Fetch artist details
  const { data: artistData, isLoading: isLoadingArtist, error: errorArtist } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => getArtist(id),
    enabled: !!id,
  });

  // Fetch artist top tracks
  const { data: topTracksData, isLoading: isLoadingTracks, error: errorTracks } = useQuery({
    queryKey: ['artistTopTracks', id],
    queryFn: () => getArtistTopTracks(id),
    enabled: !!id,
  });

  // Fetch artist albums
  const { data: albumsData, isLoading: isLoadingAlbums, error: errorAlbums } = useQuery({
    queryKey: ['artistAlbums', id],
    queryFn: () => getArtistAlbums(id),
    enabled: !!id,
  });

  const isLoading = isLoadingArtist || isLoadingTracks || isLoadingAlbums;
  const error = errorArtist || errorTracks || errorAlbums;

  if (isLoading) {
    return <div className="loading">Loading artist details...</div>;
  }

  if (error) {
    console.error("Artist page loading error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Error loading artist details.";
    return <div className="error">{errorMessage} Please try again later.</div>;
  }

  const artist = artistData?.data;
  const topTracks = topTracksData?.data?.tracks || [];
  const albums = albumsData?.data?.items || [];

  const imageUrl = artist?.images?.[0]?.url || '/default-artist.png';
  const artistName = artist?.name || 'Artist Name Unavailable';
  const followers = formatNumber(artist?.followers?.total);
  const genres = artist?.genres?.join(', ') || 'No genres listed';

  return (
    <div className="artist-page detail-page"> {/* Reuse detail-page class */}
      {/* Artist Header */}
      <div className="detail-header artist-header">
        <img 
          src={imageUrl} 
          alt={artistName} 
          className="detail-image artist-image large-image" 
          onError={(e) => { e.target.onerror = null; e.target.src='/default-artist.png'}}
        />
        <div className="detail-info artist-info">
          <h1>{artistName}</h1>
          <p>{followers} followers</p>
          <p>Genres: {genres}</p>
          {/* Add popularity? artist?.popularity */}
        </div>
      </div>

      {/* Top Tracks Section */}
      {topTracks.length > 0 && (
        <section className="artist-section">
          <h2>Popular Tracks</h2>
          <ul className="artist-top-tracks-list">
            {topTracks.slice(0, 5).map((track, index) => ( // Show top 5
              <li key={track.id} className="track-list-item">
                <span className="track-number">{index + 1}</span>
                <img 
                    src={track.album?.images?.[2]?.url || '/album-thumb.png'} // Smallest album art
                    alt={track.album?.name}
                    className="track-list-item-image"
                    onError={(e) => { e.target.onerror = null; e.target.src='/album-thumb.png'}}
                />
                <div className="track-item-info">
                  <Link to={`/track/${track.id}`} className="track-name">{track.name}</Link>
                </div>
                {/* TODO: Add play button? */}
                <span className="track-duration">{formatDuration(track.duration_ms)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Albums Section (using LibraryItemCard) */}
      {albums.length > 0 && (
        <section className="artist-section">
          <h2>Discography (Albums & Singles)</h2>
          <div className="artist-discography-grid home-grid responsive-grid"> {/* Add responsive-grid class */}
            {albums.map((album) => (
              <LibraryItemCard 
                key={`${album.id}-${album.album_group}`} // Ensure unique key if same album appears in multiple groups
                item={album} 
                type="album"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArtistPage; 