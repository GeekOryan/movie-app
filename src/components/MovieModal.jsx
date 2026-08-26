import React from 'react';

const getAudienceDescription = (genres) => {
  if (!genres || genres.length === 0) return 'Anyone looking for a great watch!';
  const names = genres.map(g => g.name.toLowerCase());
  
  if (names.includes('horror') || names.includes('thriller')) return 'Perfect for viewers who love suspense, dark atmospheres, and intense psychological tension.';
  if (names.includes('science fiction') || names.includes('fantasy')) return 'Ideal for fans of world-building, futuristic concepts, and epic, imaginative storytelling.';
  if (names.includes('action') || names.includes('adventure')) return 'Great for viewers who want high stakes, fast pacing, and spectacular visual set-pieces.';
  if (names.includes('drama') || names.includes('romance')) return 'Best for those who appreciate deep character studies, emotional weight, and compelling dialogue.';
  if (names.includes('comedy')) return 'Perfect for anyone looking to unwind with sharp writing, great timing, and pure entertainment.';
  return 'A fantastic choice for movie lovers looking for a compelling and well-crafted story.';
};

const MovieModal = ({ movie, onClose }) => {
  const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube") || movie.videos?.results?.[0];
  const cast = movie.credits?.cast?.slice(0, 6) || [];

  return (
    // Overlay: fixed + centered, NO scrolling out here anymore
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      
      {/* Card: capped at 90% of screen height, scrolls INSIDE */}
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-dark-100 rounded-2xl border border-light-100/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button stays pinned while content scrolls */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/60 text-white rounded-full p-2 hover:bg-accent transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* THIS div is the scrollable part now */}
        <div className="overflow-y-auto overscroll-contain rounded-2xl">
          
          {/* Trailer or Backdrop */}
          <div className="w-full aspect-video bg-black rounded-t-2xl overflow-hidden">
            {trailer ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
                title={movie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <img 
                src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://placehold.co/1280x720/1a1638/8b7ff5?text=No+Trailer'} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 text-light-100">
            <div className="flex flex-wrap gap-3 mb-4">
              {movie.genres?.map(g => (
                <span key={g.id} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                  {g.name}
                </span>
              ))}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h2>
            
            <div className="flex items-center gap-4 text-gray-100 mb-6 text-sm">
              <span>{movie.release_date?.split('-')[0]}</span>
              <span>•</span>
              <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              <span>•</span>
              <span className="text-yellow-400 font-bold">⭐ {movie.vote_average?.toFixed(1)}</span>
            </div>

            <p className="text-light-200 mb-8 leading-relaxed text-lg">{movie.overview}</p>

            <div className="bg-primary/50 border border-light-100/10 rounded-xl p-5 mb-8">
              <h3 className="text-lg font-bold text-white mb-2">🎯 Who would enjoy this?</h3>
              <p className="text-light-200 italic">{getAudienceDescription(movie.genres)}</p>
            </div>

            {cast.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Top Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cast.map(actor => (
                    <div key={actor.id} className="flex items-center gap-3">
                      <img 
                        src={actor.profile_path ? `https://image.tmdb.org/t/p/w45${actor.profile_path}` : 'https://placehold.co/45x68/1a1638/8b7ff5?text=?'} 
                        alt={actor.name} 
                        className="w-10 h-14 rounded object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">{actor.name}</p>
                        <p className="text-gray-100 text-xs truncate">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;