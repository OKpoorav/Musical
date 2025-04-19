import axios from 'axios';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Searches YouTube for a video based on a query string.
 * @param {string} query - The search query (e.g., "Track Name Artist Name")
 * @returns {Promise<string|null>} - The video ID of the first result, or null if error/not found.
 */
export const searchYouTubeVideo = async (query) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YouTube API Key not found. Please set REACT_APP_YOUTUBE_API_KEY in your .env file.');
    return null;
  }

  if (!query || query.trim() === '') {
    console.warn('YouTube search query is empty.');
    return null;
  }

  try {
    const response = await axios.get(YOUTUBE_API_BASE_URL, {
      params: {
        part: 'snippet',
        q: query,
        maxResults: 1,
        type: 'video',
        key: apiKey,
      },
    });

    console.log('YouTube API Response:', response.data); // Log the full response for debugging

    const videoId = response.data?.items?.[0]?.id?.videoId;

    if (videoId) {
      console.log(`Found YouTube video ID for "${query}":`, videoId);
      return videoId;
    } else {
      console.warn(`No YouTube video found for query: "${query}"`, response.data);
      return null;
    }
  } catch (error) {
    console.error('Error searching YouTube:', error.response?.data || error.message || error);
    return null;
  }
}; 