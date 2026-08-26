import React from 'react';
import { useState, useEffect } from 'react';
import { useDebounce } from './hooks/useDebounce';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';
import GenreSelector from './components/GenreSelector';
import { getMovieDetails } from './tmdb';
import MovieModal from './components/MovieModal';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleMovieClick = async (movie) => {
    setIsLoadingDetails(true);
    try {
      const detailedMovieData = await getMovieDetails(movie.id);
      if (detailedMovieData && detailedMovieData.success !== false) {
        setSelectedMovie(detailedMovieData);
      }
    } catch (error) {
      console.error("Error loading movie details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // trackSearch = false on refresh, so we don't inflate your trending counts
  const fetchMovies = async (query = '', page = 1, trackSearch = true) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error('Failed to fetch movies');

      const data = await response.json();
      setMovieList(data.results || []);

      if (trackSearch && query && data.results && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
        const movies = await getTrendingMovies();
        setTrendingMovies(movies);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshMovies = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMovies(debouncedSearchTerm, nextPage, false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const loadTrending = async () => {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    };
    loadTrending();
  }, []);

  return (
    <main>
      <div className="wrapper">
        <header>
          <img src="/logo.png" alt="Logo" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <GenreSelector onMovieClick={handleMovieClick} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <div className="mt-10 flex items-center justify-between gap-4">
            <h2>All Movies</h2>
            <button
              onClick={handleRefreshMovies}
              disabled={isLoading}
              className="px-4 py-2 border border-[#d4af37]/40 text-[#d4af37] rounded-lg text-sm font-medium hover:bg-[#d4af37]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : '🔄 Show me different movies'}
            </button>
          </div>
          {isLoading && movieList.length === 0 ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}
                  onClick={() => handleMovieClick(movie)} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {isLoadingDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[#d4af37]"></div>
          <p className="text-white font-medium">Loading movie details...</p>
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </main>
  );
};

export default App;