const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};
// Fetches the list of all available movie genres from TMBD 
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
        console.log("Error fetching genres:", error);
        return [];
    }
}

// Fetching movie recommendations based on an array of genre IDs

export const getRecommendations = async (genreIds) => {
    try {
        const genreString = genreIds.join(',');

        const url = `${API_BASE_URL}/discover/movie?with_genres=${genreString}&sort_by=popularity.desc`;

        const response = await fetch(url, API_OPTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data.results;
    } catch (error) {
        console.log("Error fetching recommendations:", error);
        return [];
    };
}