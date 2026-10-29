const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

// Fetches the list of all available movie genres from TMDB 
export const getGenres = async () => {
    try {
        const url = `${API_BASE_URL}/genre/movie/list`;
        const response = await fetch(url, API_OPTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
}

// Fetching movie recommendations based on genres, page, and region codes
export const getRecommendations = async (genreIds, currentPage = 1, regionCodes = []) => {
    try {
        const params = new URLSearchParams({
            sort_by: 'popularity.desc',
            'vote_count.gte': '20',
            'vote_average.gte': '6',
            page: String(currentPage),
        });

        // TMDB uses "|" for OR and "," for AND in these filters. Selecting
        // multiple genres or countries should broaden the result set.
        if (genreIds.length > 0) {
            params.set('with_genres', genreIds.join('|'));
        }
        if (regionCodes.length > 0) {
            params.set('with_origin_country', regionCodes.join('|'));
        }

        const url = `${API_BASE_URL}/discover/movie?${params.toString()}`;

        const response = await fetch(url, API_OPTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};

// Fetches full movie details, including videos (trailers) and credits (cast)
export const getMovieDetails = async (movieId) => {
    try {
        const url = `${API_BASE_URL}/movie/${movieId}?append_to_response=videos,credits`;
        
        const response = await fetch(url, API_OPTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
};