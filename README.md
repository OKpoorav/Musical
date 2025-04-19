# Musicalish - Spotify & YouTube Music App

**Live Demo:** [**musicalish.netlify.app**](https://musicalish.netlify.app/)

Musical is a web application that combines the Spotify Web API for browsing music discovery (artists, albums, categories, playlists, search) with the YouTube IFrame Player API for actual audio playback. It aims to provide a familiar music streaming interface.

## Features

*   **Spotify Data Integration:**
    *   Browse Featured Playlists & Categories.
    *   View Album details and track listings.
    *   View Artist details (top tracks, albums).
    *   Search for Tracks, Artists, and Albums.
    *   Region-specific content (Defaults to India - IN).
*   **YouTube Playback:**
    *   Audio playback powered by the YouTube IFrame Player API.
    *   Automatic search for corresponding YouTube videos based on Spotify track/artist info.
*   **Player Controls:**
    *   Play/Pause functionality.
    *   Visual progress bar with current time/duration.
    *   Seek functionality by clicking/dragging the progress bar.
    *   Volume control slider.
*   **User Interface:**
    *   Responsive design adapting to Desktop, Tablet, and Mobile views.
    *   Collapsible/Slide-out sidebar navigation for mobile.
    *   Consistent card-based UI for browsing items.
    *   Visual feedback for loading states and errors.
*   **Local Library (Basic):**
    *   Ability to add/remove Albums and Playlists to a local library (using browser `localStorage`).
    *   Visual indication (heart icon) on cards if an item is in the library.

## Tech Stack

*   **Frontend:** React.js
*   **Routing:** React Router (`react-router-dom`)
*   **State Management:** React Context API, `useState`, `useRef`, `useCallback`
*   **Data Fetching:** React Query (`@tanstack/react-query`) for server state management, caching, and background updates.
*   **API Interaction:** Axios for making HTTP requests.
*   **Audio Playback:** YouTube IFrame Player API (`react-youtube` wrapper)
*   **Styling:** CSS (including CSS Variables, Flexbox, Grid, Media Queries)
*   **Icons:** React Icons (`react-icons`)
*   **Animations:** Framer Motion (`framer-motion`) for subtle UI animations.

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd musical # Or your project directory name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Spotify API Credentials:**
    *   This project uses the Spotify Client Credentials Flow.
4.  **YouTube API Key:**
    *   A YouTube Data API v3 key is required for searching videos.
    *   **Important:**
        *   Add to your `.env` file:
            ```
            REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
            ```
        *   Update `src/services/youtube.js` to use `process.env.REACT_APP_YOUTUBE_API_KEY`.
5.  **Run the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The application should open automatically in your default browser at `http://localhost:3000`.

## Deployment (Netlify)

This React application (created with Create React App) is well-suited for deployment on platforms like Netlify.

**The live version is deployed at:** [**https://musicalish.netlify.app/**](https://musicalish.netlify.app/)

1.  **Build the project:**
    ```bash
    npm run build
    # or
    yarn build
    ```
    This creates an optimized production build in the `build/` directory.
2.  **Configure Netlify:**
    *   Connect your Git repository (GitHub, GitLab, Bitbucket) to Netlify.
    *   **Site Name:** `musicalish` (or your preferred name)
    *   **Build command:** `npm run build` (or `yarn build`)
    *   **Publish directory:** `build`
    *   **Environment Variables:** Add your `REACT_APP_SPOTIFY_CLIENT_ID`, `REACT_APP_SPOTIFY_CLIENT_SECRET`, and `REACT_APP_YOUTUBE_API_KEY` to the Netlify site's build environment variables (Site settings -> Build & deploy -> Environment).

Netlify will automatically build and deploy your site when you push changes to your connected Git branch.
