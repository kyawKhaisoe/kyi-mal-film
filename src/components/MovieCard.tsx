"use client";

import { useState, useEffect, useRef } from "react";
import { IMAGE_BASE_URL, API_KEY, BASE_URL } from "@/constants/tmdb";
import { Movie } from "@/types/movie";

interface MovieCardProps {
    movie: Movie;
    onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [videoKey, setVideoKey] = useState<string | null>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const imagePath = movie.backdrop_path || movie.poster_path;
    const movieName = movie.title || movie.name || movie.original_name;

    const [hasInteracted, setHasInteracted] = useState(false);

    // Track user interaction for audio policy
    useEffect(() => {
        const handleInteraction = () => setHasInteracted(true);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setVideoKey(null);
        setIsVideoLoaded(false);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    // Fetch trailer when hovered for 3 seconds
    useEffect(() => {
        let abortController: AbortController | null = null;

        if (isHovered) {
            hoverTimeoutRef.current = setTimeout(async () => {
                abortController = new AbortController();
                try {
                    const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');

                    const fetchVideos = async (type: string) => {
                        const url = `${BASE_URL}/${type}/${movie.id}/videos?api_key=${API_KEY}&language=en-US`;
                        console.log(`[MovieCard ${movie.id}] Fetching videos from: ${url}`);
                        const response = await fetch(url, { signal: abortController?.signal });
                        if (!response.ok) {
                            console.error(`[MovieCard ${movie.id}] Failed to fetch videos: ${response.status} ${response.statusText}`);
                            return null;
                        }
                        const data = await response.json();
                        return data.results || [];
                    };

                    let results = await fetchVideos(mediaType);

                    // If no results and it was a movie, try tv fallback
                    if ((!results || results.length === 0) && mediaType === 'movie') {
                        results = await fetchVideos('tv');
                    }

                    if (results && results.length > 0) {
                        const trailer = results.find((vid: any) =>
                            vid.site === "YouTube" && vid.type === "Trailer"
                        );
                        const fallbackVideo = results.find((vid: any) => vid.site === "YouTube");

                        const finalKey = trailer?.key || fallbackVideo?.key;

                        if (finalKey) {
                            console.log('Video Key:', finalKey);
                            setVideoKey(finalKey);
                        } else {
                            console.log(`[MovieCard ${movie.id}] No YouTube video found for "${movieName}" among ${results.length} results. Results:`, results);
                        }
                    } else {
                        console.log(`[MovieCard ${movie.id}] No video results found from TMDB for "${movieName}"`);
                    }
                } catch (error: any) {
                    if (error.name === 'AbortError') {
                        console.log(`[MovieCard ${movie.id}] Fetch aborted due to mouse leave`);
                    } else {
                        console.error(`[MovieCard ${movie.id}] Error fetching trailer from TMDB:`, error);
                    }
                }
            }, 3000); // 3 seconds delay
        } else {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setVideoKey(null); // Reset when unhovered
            setIsVideoLoaded(false);
        }

        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (abortController) abortController.abort();
        };
    }, [isHovered, movie.id, movie.media_type, movie.name]);

    if (!imagePath) return null;

    return (
        <div
            className="group relative transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer rounded-md shadow-lg overflow-hidden hover:ring-2 hover:ring-[#00ADFF] hover:shadow-[0_0_20px_rgba(0,173,255,0.4)] aspect-video bg-[#181818]"
            onClick={() => onClick(movie)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Image - Absolute so video can overlay it smoothly */}
            <img
                src={`${IMAGE_BASE_URL}${imagePath}`}
                alt={movieName}
                className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* YouTube Video Player Embed - Added scale-125 for smooth sustained zoom-in */}
            {videoKey && (
                <div className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-[30000ms] ease-linear flex items-center justify-center ${isVideoLoaded ? 'opacity-100 scale-125 z-50' : 'opacity-0 scale-100 z-40'}`}>
                    <div className="absolute w-[180%] h-[180%] max-w-none">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${hasInteracted ? '0' : '1'}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                            title="Trailer"
                            className="w-full h-full border-0 pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            onLoad={() => setIsVideoLoaded(true)}
                        />
                    </div>
                </div>
            )}

            {/* Gradient Overlay & Text (Hidden when playing video for cleaner look) */}
            <div className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/95 to-transparent flex flex-col justify-end p-2 z-30 transition-opacity duration-500 ${isVideoLoaded ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                <p className="text-white text-xs md:text-sm font-bold text-center truncate drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
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
}
