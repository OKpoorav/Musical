import axios from 'axios';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

const spotifyApi = axios.create({
  baseURL: SPOTIFY_BASE_URL,
});

spotifyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state&response_type=token&show_dialog=true`;

export const getTopTracks = () => spotifyApi.get('/me/top/tracks');
export const getFeaturedPlaylists = () => spotifyApi.get('/browse/featured-playlists');
export const getNewReleases = () => spotifyApi.get('/browse/new-releases');
export const getTrack = (id) => spotifyApi.get(`/tracks/${id}`);
export const getArtist = (id) => spotifyApi.get(`/artists/${id}`);
export const getAlbum = (id) => spotifyApi.get(`/albums/${id}`);
export const search = (query) => spotifyApi.get(`/search?q=${query}&type=track,artist,album`);
export const getUserPlaylists = () => spotifyApi.get('/me/playlists');
export const getUserSavedTracks = () => spotifyApi.get('/me/tracks');

export default spotifyApi; 