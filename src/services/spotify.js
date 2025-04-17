import axios from 'axios';
import { Buffer } from 'buffer'; // Import Buffer for Base64 encoding

// TODO: Use environment variables for credentials in a real application
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

  // If a token request is already in progress, wait for it
  if (tokenPromise) {
    return tokenPromise;
  }

  console.log('Requesting new Spotify access token...');

  // Start a new token request
  tokenPromise = (async () => {
    try {
      const response = await axios.post(
        SPOTIFY_ACCOUNTS_URL,
        new URLSearchParams({
          grant_type: 'client_credentials'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
          },
        }
      );

      console.log('Token received successfully');
      accessToken = response.data.access_token;
      // console.log("Spotify Token Obtained:", accessToken); // For debugging
      tokenPromise = null; // Clear the promise once resolved
      return accessToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error.response?.data || error.message);
      tokenPromise = null; // Clear the promise on error
      throw error; // Re-throw the error
    }
  })();

  return tokenPromise;
};


const spotifyApi = axios.create({
  baseURL: SPOTIFY_BASE_URL,
});

// Add response interceptor to handle common errors
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
    return Promise.reject(error);
  }
);

// Interceptor to add the token to requests
spotifyApi.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Making request to: ${config.url}`);
    } else {
       console.error("No Spotify access token available for request.");
       // Optionally handle this case, e.g., by throwing an error or queueing the request
    }
  } catch (error) {
     console.error("Failed to get access token for request interceptor:", error);
     // Handle the error appropriately, maybe cancel the request
     return Promise.reject(error);
  }
  return config;
}, (error) => {
  // Handle request configuration errors
  return Promise.reject(error);
});

// API Call Functions
export const getTopTracks = () => spotifyApi.get('/me/top/tracks'); // Note: Will not work without User Auth
export const getFeaturedPlaylists = () => spotifyApi.get('/browse/featured-playlists');
export const getNewReleases = () => spotifyApi.get('/browse/new-releases');
export const getTrack = (id) => spotifyApi.get(`/tracks/${id}`);
export const getArtist = (id) => spotifyApi.get(`/artists/${id}`);
export const getAlbum = (id) => spotifyApi.get(`/albums/${id}`);
export const search = (query) => spotifyApi.get(`/search?q=${encodeURIComponent(query)}&type=track,artist,album`);
export const getUserPlaylists = () => spotifyApi.get('/me/playlists'); // Note: Will not work without User Auth
export const getUserSavedTracks = () => spotifyApi.get('/me/tracks'); // Note: Will not work without User Auth

export default spotifyApi; 