"use client";

import { useState, useEffect } from "react";
import { IMAGE_BASE_URL, API_KEY, BASE_URL } from "@/constants/tmdb";
import { Movie, MovieDetails } from "@/types/movie";
import MovieModal from "./MovieModal";

interface RowUIProps {
    title: string;
    movies: Movie[];
    isLargeRow?: boolean;
}

export default function RowUI({ title, movies, isLargeRow = false }: RowUIProps) {
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
            handleCloseModal();
            return;
        }
        setSelectedMovie(movie);
    };

    const handleCloseModal = () => {
        setSelectedMovie(null);
    };

    const opts = {
        height: "100%",
        width: "100%",
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <div className="pl-4 md:pl-12 pt-2 pb-6">
            <h2 className="text-white font-semibold text-lg md:text-2xl mb-4 md:mb-6">{title}</h2>

            <div className="flex overflow-x-scroll overflow-y-hidden space-x-4 md:space-x-6 scrollbar-hide pb-4">
                {movies.map((movie) => {
                    const imagePath = isLargeRow ? movie.poster_path : movie.backdrop_path;
                    if (!imagePath) return null;

                    const movieName = movie?.title || movie?.name || movie?.original_name;

                    return (
                        <div
                            key={movie.id}
                            className={`group relative flex-none transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer rounded-md shadow-lg overflow-hidden ${isLargeRow ? "w-[120px] md:w-[180px] lg:w-[220px]" : "w-[200px] md:w-[280px] lg:w-[340px]"
                                }`}
                            onClick={() => handleClick(movie)}
                        >
                            <img
                                src={`${IMAGE_BASE_URL}${imagePath}`}
                                alt={movieName}
                                className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Dark gradient overlay that fades in on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col justify-end p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

            <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
        </div>
    );
}
