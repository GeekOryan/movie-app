import React from 'react'

// Notice: onClick is OUTSIDE the movie destructuring. 
// It is a completely separate prop.
const MovieCard = ({ movie: { id, title, vote_average, poster_path, release_date, original_language }, onClick }) => {
    return (
        // Notice: All Tailwind classes are INSIDE the quotes for className.
        <button
            onClick={onClick}
            className="movie-card cursor-pointer hover:scale-105 transition-transform duration-300 w-full text-left"
        >
            <img
                src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : 'https://placehold.co/500x750?text=No+Poster'}
                alt={title}
            />

            <div className="mt-4">
                <h3>{title}</h3>

                <div className="content">
                    <div className="rating">
                        <img src="star.svg" alt="Star Icon" />
                        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                    </div>

                    <span>•</span>
                    <p className="lang">{original_language}</p>

                    <span>•</span>
                    <p className="year">
                        {release_date ? release_date.split('-')[0] : 'N/A'}
                    </p>
                </div>
            </div>
        </button>
    )
}

export default MovieCard