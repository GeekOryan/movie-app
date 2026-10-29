import { useState, useEffect, useRef } from 'react';
import { getGenres, getRecommendations } from '../tmdb';
import MovieCard from './MovieCard';
import Spinner from './Spinner';

const REGIONS = [
    { id: 'usa', label: '🇺🇸 USA', codes: ['US'] },
    { id: 'uk', label: '🇬🇧 UK', codes: ['GB'] },
    { id: 'europe', label: '🇪🇺 Europe', codes: ['FR', 'DE', 'IT', 'ES', 'SE', 'DK', 'NL', 'PL', 'NO', 'BE', 'IE', 'PT', 'GR', 'HU', 'CZ'] },
    { id: 'china', label: '🇨🇳 China', codes: ['CN', 'HK'] },
    { id: 'japan', label: '🇯🇵 Japan', codes: ['JP'] },
    { id: 'korea', label: '🇰🇷 Korea', codes: ['KR'] },
    { id: 'russia', label: '🇷🇺 Russia', codes: ['RU'] },
    { id: 'india', label: '🇮🇳 India', codes: ['IN'] },
    { id: 'africa', label: '🌍 Africa', codes: ['NG', 'ZA', 'GH', 'KE'] },
    { id: 'latam', label: '🌎 Latin America', codes: ['MX', 'BR', 'AR', 'CO'] },
];

const GenreSelector = ({ onMovieClick }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showNoMoreMoviesModal, setShowNoMoreMoviesModal] = useState(false);
    const shownMovieIds = useRef(new Set());
    
    const [selectedRegionIds, setSelectedRegionIds] = useState([]);

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
        } else {
            setSelectedGenreIds([...selectedGenreIds, genreId]);
        }
    };

    const toggleRegion = (regionId) => {
        if (selectedRegionIds.includes(regionId)) {
            setSelectedRegionIds(selectedRegionIds.filter(id => id !== regionId));
        } else {
            setSelectedRegionIds([...selectedRegionIds, regionId]);
        }
    };

    const selectedRegionCodes = REGIONS
        .filter((region) => selectedRegionIds.includes(region.id))
        .flatMap((region) => region.codes);

    const selectedRegionNames = REGIONS
        .filter((region) => selectedRegionIds.includes(region.id))
        .map((region) => region.label)
        .join(', ');

    const selectedGenreNames = genres
        .filter((genre) => selectedGenreIds.includes(genre.id))
        .map((genre) => genre.name)
        .join(', ');

    const handleGetRecommendations = async () => {
        if (selectedGenreIds.length === 0 && selectedRegionIds.length === 0) {
            return;
        }

        setIsLoading(true);
        try {
            const movies = await getRecommendations(selectedGenreIds, 1, selectedRegionCodes);
            shownMovieIds.current = new Set(movies.map((movie) => movie.id));
            setCurrentPage(1);
            setRecommendedMovies(movies);
        } catch (error) {
            console.error("Error getting recommendations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            const nextPage = currentPage + 1;
            setIsLoading(true);
            const movies = await getRecommendations(selectedGenreIds, nextPage, selectedRegionCodes);
            const newMovies = movies.filter((movie) => !shownMovieIds.current.has(movie.id));

            if (newMovies.length > 0) {
                newMovies.forEach((movie) => shownMovieIds.current.add(movie.id));
                setRecommendedMovies(newMovies);
                setCurrentPage(nextPage);
            } else {
                setShowNoMoreMoviesModal(true);
            }
        } catch (error) {
            console.error("Failed to refresh movies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-10 p-6 bg-dark-100 rounded-2xl shadow-inner shadow-light-100/10">
            <h2 className="text-2xl font-bold text-white mb-2">What are you in the mood for?</h2>
            <p className="text-light-200 mb-5 text-sm">Select one or more genres and/or regions to get a personalized recommendation</p>

            <div className="flex flex-wrap gap-3 mb-4">
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

            <p className="text-light-200 text-sm mt-4 mb-2">...From where?</p>
            <div className="flex flex-wrap gap-3">
                {REGIONS.map((region) => {
                    const isSelected = selectedRegionIds.includes(region.id);
                    return (
                        <button
                            key={region.id}
                            onClick={() => toggleRegion(region.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                isSelected
                                    ? 'bg-accent border-accent text-white scale-105 shadow-lg shadow-accent/20'
                                    : 'bg-transparent border-light-100/20 text-light-100 hover:bg-light-100/10 hover:border-light-100/40'
                            }`}
                        >
                            {region.label}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleGetRecommendations}
                disabled={isLoading || (selectedGenreIds.length === 0 && selectedRegionIds.length === 0)}
                className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#f6e7c1] to-[#d4af37] text-primary font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
                {isLoading ? 'Finding Movies...' : 'Get Recommendations'}
            </button>

            {recommendedMovies.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-xl font-bold text-white mb-5 flex items-center justify-between">
                        Because you picked: <span className="text-gradient">{selectedGenreNames} {selectedRegionNames ? `• ${selectedRegionNames}` : ''}</span>
                    </h3>

                    <button 
                        onClick={handleRefresh}
                        disabled={isLoading} 
                        className="mb-5 px-4 py-2 border border-[#d4af37]/40 text-[#d4af37] rounded-lg text-sm font-medium hover:bg-[#d4af37]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Loading...' : '🔄️ Show me different movies'}
                    </button>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner />
                       . </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {recommendedMovies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} 
                                    onClick={() => onMovieClick(movie)} />
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {showNoMoreMoviesModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="no-more-movies-title"
                    onClick={() => setShowNoMoreMoviesModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-dark-100 p-6 text-center shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3
                            id="no-more-movies-title"
                            className="mb-3 text-2xl font-bold text-white"
                        >
                            That's it for the heavy hitters!
                        </h3>

                        <p className="mb-6 text-light-200">
                            We couldn't find any more movies for this combination.
                            Try mixing different genres or regions.
                        </p>

                        <button
                            onClick={() => setShowNoMoreMoviesModal(false)}
                            className="rounded-lg bg-gradient-to-r from-[#f6e7c1] to-[#d4af37] px-6 py-3 font-bold text-primary transition-opacity hover:opacity-90"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenreSelector;