"use client";

import { useState, useEffect } from "react";
import { IMAGE_BASE_URL, API_KEY, BASE_URL } from "@/constants/tmdb";
import { Movie, MovieDetails } from "@/types/movie";
import MovieModal from "./MovieModal";

interface SearchGridProps {
    searchQuery: string;
    movies: Movie[];
}

export default function SearchGrid({ searchQuery, movies }: SearchGridProps) {
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason && event.reason.name === "AbortError") {
                event.preventDefault();
            }
        };
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    }, []);

    const handleClick = (movie: Movie) => {
        if (selectedMovie?.id === movie.id) {
            setSelectedMovie(null);
            return;
        }
        setSelectedMovie(movie);
    };

    return (
        <div className="pt-24 px-4 md:px-12 min-h-screen bg-[#141414]">
            <h1 className="text-white text-2xl md:text-3xl font-semibold mb-6">
                Search Results for "{searchQuery}"
            </h1>

            {movies.length === 0 ? (
                <div className="text-gray-400 text-lg">
                    No results found for "{searchQuery}". Suggestions:
                    <ul className="list-disc ml-8 mt-4 space-y-2">
                        <li>Try different keywords</li>
                        <li>Looking for a movie or TV show?</li>
                        <li>Try using a movie, TV show actor or director's name</li>
                    </ul>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                    {movies.map((movie) => {
                        const imagePath = movie.backdrop_path || movie.poster_path;
                        if (!imagePath) return null;

                        const movieName = movie?.title || movie?.name || movie?.original_name;

                        return (
                            <div
                                key={movie.id}
                                className="group relative transition-all duration-300 hover:scale-105 hover:z-50 cursor-pointer rounded-md shadow-lg overflow-hidden hover:ring-2 hover:ring-[#00ADFF] hover:shadow-[0_0_20px_rgba(0,173,255,0.4)]"
                                onClick={() => handleClick(movie)}
                            >
                                <img
                                    src={`${IMAGE_BASE_URL}${imagePath}`}
                                    alt={movieName}
                                    className="w-full h-auto aspect-video object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/95 to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-xs md:text-sm font-bold text-center truncate drop-shadow-md">
                                        {movieName}
                                    </p>
                                    {movie.vote_average ? (
                                        <p className="text-green-400 text-[10px] md:text-xs font-semibold text-center mt-1">
                                            {Math.round(movie.vote_average * 10)}% Match
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        </div>
    );
}
