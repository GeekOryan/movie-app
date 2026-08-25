import { useState, useEffect } from 'react';
import { getGenres, getRecommendations } from '../tmdb';

const GenreSelector = () => {
    // The state to hold the list of all genres from TMDB
    const [genres, setGenres] = useState([]);

    // The state to hold the IDs of the genres the user has clicked
    const [selectedGenreIds, setSelectedGenreIds] = useState([]);

    // Loading state for when we are fetching recommendations
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            const tmdbGenres = await getGenres();
            setGenres(tmdbGenres);
        };
        fetchGenres();
    }, []);

    const toggleGenre = (genreId) => {
        if (selectedGenreIds.includes(genreId)) {
            setSelectedGenreIds(selectedGenreIds.filter(id => id !== genreId));
        }
        else {
            setSelectedGenreIds([...selectedGenreIds, genreId]);
        }
    };

    const handleGetRecommendations = async () => {
        if (selectedGenreIds.length === 0) {
            console.log("Please select at least one genre!");
            return;
        }

        setIsLoading(true);
        try {
            // Calling the function from tmdb.js
            const movies = await getRecommendations(selectedGenreIds);

            console.log("Recommended Movies:", movies);
        } catch (error) {
            console.error("Error getting recommendations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-10 p-6 bg-dark-100 rounded-2xl shadow-inner shadow-light-100/10">
            <h2 className="text-2xl font-bold text-white mb-2">What are you in the mood for?</h2>
            <p className="text-light-200 mb-5 text-sm">Select one or more genres to get a personalized recommendation</p>

            {/* Rendering the genre buttons */}
            <div className="flex flex-wrap gap-3">
                {genres.map((genre) => {
                    const isSelected = selectedGenreIds.includes(genre.id);
                    return (
                        <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                isSelected
                                    ? 'bg-accent border-accent text-white scale-105 shadow-lg shadow-accent/20'
                                    : 'bg-transparent border-light-100/20 text-light-100 hover:bg-light-100/10 hover:border-light-100/40'
                            }`}
                        >
                                {genre.name}
                            </button>
                    );
                })}
            </div>

            {/* Render the Submit button */}
            <button
                onClick={handleGetRecommendations}
                disabled={isLoading || selectedGenreIds.length === 0}
                className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary font-bold rounded-lg transition-opacity disabled:opacity-50 disable:cursor-not-allowed hover:opacity-90"
            >
                {isLoading ? 'Finding Movies...' : 'Get Recommendations'}
            </button>
        </div>
    );
};

export default GenreSelector;