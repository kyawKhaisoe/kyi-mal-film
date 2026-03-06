"use client";

import { useState, useEffect, useRef } from "react";
import { IMAGE_BASE_URL, API_KEY, BASE_URL } from "@/constants/tmdb";
import { Movie, MovieDetails } from "@/types/movie";
import { X, Play, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddToListButton from "@/components/AddToListButton";

interface MovieModalProps {
    movie: Movie | null;
    onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
    const [trailerUrl, setTrailerUrl] = useState<string | null>("");
    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [origin, setOrigin] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const sendYouTubeCommand = (func: "mute" | "unMute") => {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        win.postMessage(
            JSON.stringify({ event: "command", func, args: [] }),
            "*"
        );
    };

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        if (!movie) {
            setTrailerUrl("");
            setMovieDetails(null);
            setIsVideoReady(false);
            setIsMuted(true);
            return;
        }

        const controller = new AbortController();

        const fetchDetails = async () => {
            try {
                const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
                const response = await fetch(
                    `https://api.themoviedb.org/3/${mediaType}/${movie.id}?api_key=${API_KEY}&append_to_response=videos,credits`,
                    { signal: controller.signal }
                );

                if (response.ok) {
                    const data = await response.json();
                    setMovieDetails(data);

                    if (data.videos && data.videos.results) {
                        const trailer = data.videos.results.find(
                            (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
                        );
                        if (trailer?.key) {
                            setTrailerUrl(trailer.key);
                        } else {
                            setTrailerUrl("");
                        }
                    } else {
                        setTrailerUrl("");
                    }
                }
            } catch (error: any) {
                if (error.name === "AbortError") {
                    console.log("Fetch aborted for MovieModal");
                } else {
                    console.error("Error fetching movie details:", error);
                    setTrailerUrl("");
                }
            }
        };

        fetchDetails();

        return () => {
            controller.abort();
        };
    }, [movie]);

    if (!movie) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00ADFF]/20 backdrop-blur-md px-4 md:px-0"
            >
                <motion.div
                    initial={{ scale: 0.7, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.4 }}
                    className="relative bg-[#181818] border border-[#00ADFF]/30 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] scrollbar-hide"
                >
                    <div className="relative pt-[56.25%] w-full bg-black shrink-0">
                        {trailerUrl && origin ? (
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] pointer-events-none">
                                    <iframe
                                        ref={iframeRef}
                                        src={`https://www.youtube-nocookie.com/embed/${trailerUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&origin=${origin}`}
                                        title="Trailer"
                                        className="w-full h-full border-0 pointer-events-none"
                                        allow="autoplay; encrypted-media"
                                        onLoad={() => setTimeout(() => setIsVideoReady(true), 300)}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none z-10" />

                                <div
                                    className={`absolute inset-0 w-full h-full bg-[#181818] transition-opacity duration-1000 pointer-events-none z-40 ${isVideoReady ? "opacity-0" : "opacity-100"}`}
                                >
                                    <img
                                        src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                                        className="w-full h-full object-cover"
                                        alt="Background"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>
                        ) : trailerUrl === "" ? (
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center flex-start bg-black">
                                <img
                                    src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                                    alt="Background"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent pointer-events-none z-10" />
                            </div>
                        ) : (
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#181818]">
                                <div className="w-10 h-10 border-4 border-gray-600 border-t-[#00ADFF] rounded-full animate-spin"></div>
                            </div>
                        )}

                        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-50 w-full pr-10 flex justify-between items-end">
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-2xl">
                                    {movie.title || movie.name || movie.original_name}
                                </h2>

                                <div className="flex items-center space-x-3 pt-2">
                                    <button className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded md:text-xl font-bold hover:bg-white/80 transition shadow-md">
                                        <Play size={24} fill="black" />
                                        Play
                                    </button>
                                    <AddToListButton movie={movie} />
                                </div>
                            </div>

                            <div className="mr-6 md:mr-10 flex space-x-4 pointer-events-auto">
                                {trailerUrl && (
                                    <button
                                        onClick={() => {
                                            setIsMuted((prev) => {
                                                const next = !prev;
                                                sendYouTubeCommand(next ? "mute" : "unMute");
                                                return next;
                                            });
                                        }}
                                        className="flex items-center justify-center p-3 border border-gray-400 rounded-full bg-[#181818]/80 text-[#00ADFF] hover:bg-[#00ADFF]/20 hover:border-[#00ADFF] transition cursor-pointer shadow-lg z-50 pointer-events-auto"
                                    >
                                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 md:px-12 pb-12 pt-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-4 mb-4 text-sm md:text-base font-semibold drop-shadow">
                                    <span className="text-green-400">{Math.round((movie.vote_average || 0) * 10)}% Match</span>
                                    <span className="text-gray-300">{(movie.release_date || movie.first_air_date)?.substring(0, 4)}</span>
                                    <span className="border border-gray-500 px-2 py-0.5 rounded text-gray-300 text-xs">HD</span>
                                </div>
                                <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm font-medium">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{ zIndex: 9999 }}
                        className="absolute top-4 right-4 p-2 rounded-full bg-[#181818]/60 text-white hover:bg-white/40 transition-all cursor-pointer shadow-lg border border-white/20"
                    >
                        <X size={24} />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
