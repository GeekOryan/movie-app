import { useState, useEffect, useRef } from 'react';
import { getGenres, getRecommendations } from '../tmdb';
import { searchMovieByTitle, getMovieRecommendations } from '../tmdb';
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

const VIBES = [
    { id: 'hood', label: '🏙️ Hood Classics', keywords: [10700, 33905, 10726] },  // hood, inner city, gang
    { id: 'nordic', label: '❄️ Nordic Noir', keywords: [191820] },
    { id: 'wuxia', label: '⚔️ Wuxia / Martial Arts', keywords: [184656] },
    { id: 'cyberpunk', label: '🤖 Cyberpunk', keywords: [12190] },
    { id: 'heist', label: '💰 Heist', keywords: [10051] },
];

const SEED_MOVIE_SUGGESTIONS = [
    'John Wick',
    'The Matrix',
    'Parasite',
    'The Dark Knight',
    'Spirited Away',
    'Mad Max: Fury Road',
    'Get Out',
    'Everything Everywhere All at Once',
    'Moonlight',
    'The Grand Budapest Hotel',
    'City of God',
    'Knives Out',
];

const GenreSelector = ({ onMovieClick }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedVibeIds, setSelectedVibeIds] = useState([]);
    const [seedMovieTitle, setSeedMovieTitle] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showAllSeedSuggestions, setShowAllSeedSuggestions] = useState(false);
    const shownMovieIds = useRef(new Set());
    
    const [selectedRegionIds, setSelectedRegionIds] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const tmdbGenres = await getGenres();
                setGenres(tmdbGenres);
            } catch (error) {
                console.error('Error loading genres:', error);
                setModalMessage('Unable to load genres. Please try again later.');
            }
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

    const toggleVibe = (vibeId) => {
        if (selectedVibeIds.includes(vibeId)) {
            setSelectedVibeIds(selectedVibeIds.filter(id => id !== vibeId));
        } else {
            setSelectedVibeIds([...selectedVibeIds, vibeId]);
        }
    };

    const selectedRegionCodes = REGIONS
        .filter((region) => selectedRegionIds.includes(region.id))
        .flatMap((region) => region.codes);

    const selectedKeywordIds = VIBES
        .filter((vibe) => selectedVibeIds.includes(vibe.id))
        .flatMap((vibe) => vibe.keywords);

    const selectedRegionNames = REGIONS
        .filter((region) => selectedRegionIds.includes(region.id))
        .map((region) => region.label)
        .join(', ');

    const selectedGenreNames = genres
        .filter((genre) => selectedGenreIds.includes(genre.id))
        .map((genre) => genre.name)
        .join(', ');

    const handleGetRecommendations = async () => {
        if (selectedGenreIds.length === 0 && selectedRegionIds.length === 0 && selectedVibeIds.length === 0) {
            setModalMessage('Please select at least one genre, region, or vibe.');
            return;
        }

        setIsLoading(true);
        try {
            const movies = await getRecommendations(selectedGenreIds, 1, selectedRegionCodes, selectedKeywordIds);
            shownMovieIds.current = new Set(movies.map((movie) => movie.id));
            setCurrentPage(1);
            setRecommendedMovies(movies);
        } catch (error) {
            console.error("Error getting recommendations:", error);
            setModalMessage('Unable to load recommendations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            const nextPage = currentPage + 1;
            setIsLoading(true);
            const movies = await getRecommendations(selectedGenreIds, nextPage, selectedRegionCodes, selectedKeywordIds);
            const newMovies = movies.filter((movie) => !shownMovieIds.current.has(movie.id));

            if (newMovies.length > 0) {
                newMovies.forEach((movie) => shownMovieIds.current.add(movie.id));
                setRecommendedMovies(newMovies);
                setCurrentPage(nextPage);
            } else {
                setModalMessage("That's it for the heavy hitters! Try mixing different genres or regions.");
            }
        } catch (error) {
            console.error("Failed to refresh movies:", error);
            setModalMessage('Unable to load different movies. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedSearch = async () => {
        if (!seedMovieTitle.trim()) {
            setModalMessage('Please enter a movie title.');
            return;
        }

        setIsSearching(true);
        try {
            const movie = await searchMovieByTitle(seedMovieTitle);

            if (!movie) {
                setModalMessage('Movie not found. Try a different title.');
                return;
            }

            setCurrentPage(1);
            const recommendations = await getMovieRecommendations(movie.id, 1);

            setRecommendedMovies(recommendations);

            setSeedMovieTitle('');
        } catch (error) {
            console.error("Error in seed search:", error);
            setModalMessage('Something went wrong. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const seedSuggestions = showAllSeedSuggestions
        ? SEED_MOVIE_SUGGESTIONS
        : SEED_MOVIE_SUGGESTIONS.slice(0, 5);

    return (
        <div className="mt-10 rounded-2xl bg-dark-100 p-4 shadow-inner shadow-light-100/10 sm:p-6">
            <div className="mb-8 rounded-2xl border border-light-100/10 bg-gradient-to-br from-dark-200 to-dark-100 p-4 sm:p-6">
                <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">Find movies like...</h2>
                <p className="mb-4 text-sm text-light-200">Type a movie you love, and we'll find similar heavy-hitters</p>

                <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={seedMovieTitle}
                        onChange={(e) => setSeedMovieTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSeedSearch()}
                        placeholder="e.g., John Wick, The Matrix, Inception..."
                        className="min-w-0 w-full flex-1 rounded-lg border border-light-100/20 bg-dark-100 px-4 py-3 text-white placeholder-light-200/50 transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                        type="button"
                        onClick={handleSeedSearch}
                        disabled={isSearching || !seedMovieTitle.trim()}
                        className="w-full rounded-lg bg-gradient-to-r from-[#f6e7c1] to-[#d4af37] px-5 py-3 font-bold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:whitespace-nowrap"
                    >
                        {isSearching ? 'Searching...' : 'Find Similar'}
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs text-light-200">Quick picks:</span>
                    {seedSuggestions.map((movie) => (
                        <button
                            type="button"
                            key={movie}
                            onClick={() => setSeedMovieTitle(movie)}
                            className="rounded-full border border-light-100/15 bg-light-100/5 px-3 py-1.5 text-xs font-medium text-light-100 transition-all hover:border-accent/60 hover:bg-accent/15 hover:text-white"
                        >
                            {movie}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowAllSeedSuggestions((isExpanded) => !isExpanded)}
                        aria-expanded={showAllSeedSuggestions}
                        className="rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent transition-all hover:bg-accent/10 hover:text-white"
                    >
                        {showAllSeedSuggestions ? 'Show fewer' : 'More picks'}
                    </button>
                </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-light-100/10"></div>
                <span className="text-sm font-medium text-light-200">OR</span>
                <div className="h-px flex-1 bg-light-100/10"></div>
            </div>

            <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">What are you in the mood for?</h2>
            <p className="text-light-200 mb-5 text-sm">Select one or more genres and/or regions to get a personalized recommendation</p>

            <div className="flex flex-wrap gap-3 mb-4">
                {genres.map((genre) => {
                    const isSelected = selectedGenreIds.includes(genre.id);
                    return (
                        <button
                            type="button"
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
                            type="button"
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

            <p className="text-light-200 text-sm mt-6 mb-2">...Or pick a specific vibe?</p>
<div className="flex flex-wrap gap-3">
    {VIBES.map((vibe) => {
        const isSelected = selectedVibeIds.includes(vibe.id);
        return (
            <button
                key={vibe.id}
                onClick={() => toggleVibe(vibe.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                        ? 'bg-accent border-accent text-white scale-105 shadow-lg shadow-accent/20'
                        : 'bg-transparent border-light-100/20 text-light-100 hover:bg-light-100/10 hover:border-light-100/40'
                }`}
            >
                {vibe.label}
            </button>
        );
    })}
</div>

            <button
                type="button"
                onClick={handleGetRecommendations}
                disabled={isLoading || (selectedGenreIds.length === 0 && selectedRegionIds.length === 0 && selectedVibeIds.length === 0)}
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
                        type="button"
                        onClick={handleRefresh}
                        disabled={isLoading} 
                        className="mb-5 px-4 py-2 border border-[#d4af37]/40 text-[#d4af37] rounded-lg text-sm font-medium hover:bg-[#d4af37]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Loading...' : '🔄️ Show me different movies'}
                    </button>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner />
                        </div>
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

            {modalMessage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="recommendation-message-title"
                    onClick={() => setModalMessage('')}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-dark-100 p-6 text-center shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3
                            id="recommendation-message-title"
                            className="mb-3 text-2xl font-bold text-white"
                        >
                            Movie recommendations
                        </h3>

                        <p className="mb-6 text-light-200">
                            {modalMessage}
                        </p>

                        <button
                            onClick={() => setModalMessage('')}
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