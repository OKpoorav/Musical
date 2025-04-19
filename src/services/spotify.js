import axios from 'axios';
import { Buffer } from 'buffer';

// Hardcoded credentials (in a real app, these should be in environment variables)
const CLIENT_ID = '568037fe9a754246a774091dc2f5da44';
const CLIENT_SECRET = '2b79240765db4903b3cc97ef78744503';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token';

let accessToken = null;
let tokenPromise = null;

// Function to get the access token using Client Credentials Flow
const getAccessToken = async () => {
  if (accessToken) {
    // TODO: Check token expiry and refresh if necessary
    return accessToken;
  }
  if (tokenPromise) {
    return tokenPromise;
  }
  console.log('Requesting new Spotify access token...');
  tokenPromise = (async () => {
    try {
      const response = await axios.post(
        SPOTIFY_ACCOUNTS_URL,
        new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
          },
        }
      );
      console.log('Token received successfully');
      accessToken = response.data.access_token;
      tokenPromise = null;
      return accessToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error.response?.data || error.message);
      tokenPromise = null;
      throw error;
    }
  })();
  return tokenPromise;
};

const spotifyApi = axios.create({
  baseURL: SPOTIFY_BASE_URL,
});

// Response interceptor
spotifyApi.interceptors.response.use(
  (response) => {
    console.log(`Successful API call to ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API call failed:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error; // Throw error for React Query
  }
);

// Request interceptor
spotifyApi.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Making request to: ${config.url}`);
    } else {
      console.error('No token available for request');
      return Promise.reject(new Error('No access token available'));
    }
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
  return config;
});

// --- Public endpoints (Client Credentials) ---

// Get Browse Categories (Re-added country=IN)
// export const getBrowseCategories = () => 
//  spotifyApi.get('/browse/categories?country=IN&limit=50');

// Get New Releases (Limit increased to 50)
export const getNewReleases = () => 
  spotifyApi.get('/browse/new-releases?country=IN&limit=50'); // Keep country=IN, limit=50

// Get Track, Artist, Album (Use market=IN)
export const getTrack = (id) => spotifyApi.get(`/tracks/${id}?market=IN`);
export const getArtist = (id) => spotifyApi.get(`/artists/${id}`); // No market param
export const getAlbum = (id) => spotifyApi.get(`/albums/${id}?market=IN`);

// Get Artist Top Tracks (Use market=IN)
export const getArtistTopTracks = (id) => spotifyApi.get(`/artists/${id}/top-tracks?market=IN`);

// Get Artist Albums (Use market=IN, include singles/appears_on if desired)
export const getArtistAlbums = (id) => spotifyApi.get(`/artists/${id}/albums?market=IN&include_groups=album,single&limit=50`);

// Get Featured Playlists (Commented out as it causes 404)
// export const getFeaturedPlaylists = () => spotifyApi.get(`/browse/featured-playlists`); 

// Search (Use market=IN)
export const search = (query) => 
  spotifyApi.get(`/search?q=${encodeURIComponent(query)}&type=track,artist,album&market=IN&limit=20`);

// Get playlists for a specific category (Removed country=IN)
// export const getCategoryPlaylists = (id) => 
//   spotifyApi.get(`/browse/categories/${id}/playlists?limit=20`);

// --- Unused/Removed Endpoints ---
// export const getTopTracks = ...
// export const getUserPlaylists = ...
// export const getUserSavedTracks = ...
// export const getFeaturedPlaylists = ...
// export const getCategory = ...
// export const getCategoryPlaylists = ...

export default spotifyApi; 