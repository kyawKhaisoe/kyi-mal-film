"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Play, AlertCircle, X, Volume2, VolumeX, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IMAGE_BASE_URL, API_KEY, BASE_URL } from "@/constants/tmdb";
import { Movie, MovieDetails } from "@/types/movie";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import AddToListButton from "@/components/AddToListButton";

export default function MyList() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    const [trailerUrl, setTrailerUrl] = useState<string | null>("");
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setError("Please log in to view your list.");
                    setIsLoading(false);
                    return;
                }

                // Fetch favorites
                const { data, error } = await supabase
                    .from("favorites")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                if (data) {
                    // Map the favorites data into the Movie interface structure we expect
                    const mappedMovies: Movie[] = data.map((fav) => ({
                        id: fav.movie_id,
                        title: fav.title,
                        poster_path: fav.poster_path, // Could be backdrop or poster from the DB
                        backdrop_path: fav.poster_path,
                        overview: "Overview not available in your list view. Click to see details.", // Placeholder
                        genre_ids: [],
                        vote_average: 0
                    }));
                    setMovies(mappedMovies);
                }
            } catch (err: any) {
                console.error("Error fetching favorites:", err);
                setError(err.message || "Failed to load your list.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    // Also need this event listener trick for the ReactPlayer abort errors
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason && event.reason.name === "AbortError") {
                event.preventDefault();
            }
        };
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    }, []);

    const handleClick = async (movie: Movie) => {
        if (selectedMovie?.id === movie.id) {
            handleCloseModal();
            return;
        }

        setSelectedMovie(movie);
        setTrailerUrl(null); // reset while loading
        setMovieDetails(null);
        setIsVideoReady(false);
        setIsPlaying(true);

        try {
            const mediaType = movie.media_type || 'movie'; // Defaulting to movie since we don't save media_type yet

            const response = await fetch(
                `${BASE_URL}/${mediaType}/${movie.id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits`
            );

            if (response.ok) {
                const data = await response.json();
                setMovieDetails(data);
                // Also update the selectedMovie with full details so we get correct vote average and overview
                setSelectedMovie((prev) => prev ? { ...prev, ...data } : prev);

                const trailer = data.videos?.results?.find(
                    (vid: any) => vid.site === "YouTube" && vid.type === "Trailer"
                );

                if (trailer?.key) {
                    setTrailerUrl(trailer.key);
                } else {
                    const anyVideo = data.videos?.results?.find((vid: any) => vid.site === "YouTube");
                    setTrailerUrl(anyVideo?.key || "");
                }
            } else {
                // If it fails as a movie, try TV
                const tvResponse = await fetch(
                    `${BASE_URL}/tv/${movie.id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits`
                );

                if (tvResponse.ok) {
                    const tvData = await tvResponse.json();
                    setMovieDetails(tvData);
                    setSelectedMovie((prev) => prev ? { ...prev, ...tvData } : prev);

                    const trailer = tvData.videos?.results?.find((vid: any) => vid.site === "YouTube" && vid.type === "Trailer");
                    setTrailerUrl(trailer?.key || tvData.videos?.results?.find((vid: any) => vid.site === "YouTube")?.key || "");
                } else {
                    setTrailerUrl("");
                }
            }
        } catch (error) {
            console.error("Error fetching details from TMDB:", error);
            setTrailerUrl("");
        }
    };

    const handleCloseModal = () => {
        setIsPlaying(false);
        setSelectedMovie(null);
        setMovieDetails(null);
        setIsVideoReady(false);
        setIsMuted(true);
    };

    // --- RENDER STATES ---

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#141414]">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-[#00ADFF] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-white px-4">
                <div className="flex flex-col items-center max-w-lg text-center bg-black/40 p-10 rounded-2xl border border-red-500/30 backdrop-blur-md shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Oops!</h1>
                    <p className="text-gray-300 mb-8">{error}</p>
                    <Link
                        href="/"
                        className="bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-gray-200 transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-white px-4">
                <div className="flex flex-col items-center max-w-lg text-center bg-black/40 p-10 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-900 to-[#00ADFF] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,173,255,0.4)]">
                        <Plus className="h-12 w-12 text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
                        Your list is empty.
                    </h1>

                    <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
                        Start adding some films!
                    </p>

                    <Link
                        href="/"
                        className="flex items-center space-x-2 bg-[#00ADFF] text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-[#008FCC] transition-all shadow-[0_0_15px_rgba(0,173,255,0.4)] group"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Explore Home</span>
                    </Link>
                </div>

                {/* Background Aesthetic Blur */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ADFF]/20 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none -z-10" />
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 md:px-12 min-h-screen bg-[#141414]">
            <h1 className="text-white text-3xl font-bold mb-8">My List</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                {movies.map((movie) => {
                    const imagePath = movie.backdrop_path || movie.poster_path;
                    if (!imagePath) return null;

                    const movieName = movie.title || movie.name || movie.original_name;

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
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal / Video Player Overlay powered by Framer Motion - exact match with search ui */}
            <AnimatePresence>
                {selectedMovie && (
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
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 200,
                                duration: 0.4
                            }}
                            className="relative bg-[#181818] border border-[#00ADFF]/30 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] scrollbar-hide"
                        >

                            <div className="relative pt-[56.25%] w-full bg-black shrink-0">
                                {trailerUrl ? (
                                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                                        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] pointer-events-none">
                                            {(() => {
                                                const Player = ReactPlayer as any;
                                                return (
                                                    <Player
                                                        url={`https://www.youtube-nocookie.com/embed/${trailerUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                                                        width="100%"
                                                        height="100%"
                                                        playing={isPlaying}
                                                        muted={isMuted}
                                                        controls={false}
                                                        onReady={() => setTimeout(() => setIsVideoReady(true), 500)}
                                                        config={{
                                                            youtube: {
                                                                playerVars: {
                                                                    autoplay: 1,
                                                                    controls: 0,
                                                                    showinfo: 0,
                                                                    rel: 0,
                                                                    modestbranding: 1,
                                                                    iv_load_policy: 3,
                                                                    disablekb: 1
                                                                }
                                                            } as any
                                                        }}
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none z-10" />

                                        {/* Fallback Poster over Video */}
                                        <div
                                            className={`absolute inset-0 w-full h-full bg-black transition-opacity duration-700 pointer-events-none z-40 ${isVideoReady ? "opacity-0" : "opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={`${IMAGE_BASE_URL}${selectedMovie.backdrop_path || selectedMovie.poster_path}`}
                                                className="w-full h-full object-cover"
                                                alt="Background"
                                            />
                                        </div>
                                    </div>
                                ) : trailerUrl === "" ? (
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center flex-start bg-black">
                                        <img
                                            src={`${IMAGE_BASE_URL}${selectedMovie.backdrop_path || selectedMovie.poster_path}`}
                                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                                            alt="Background"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <div className="flex flex-col items-center bg-black/60 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                                <AlertCircle size={32} className="text-gray-400 mb-2" />
                                                <span className="text-lg font-semibold text-gray-300">Video format not supported</span>
                                                <span className="text-sm text-gray-500 mt-1">or trailer is currently unavailable</span>
                                            </div>
                                        </div>
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
                                            {selectedMovie?.title || selectedMovie?.name || selectedMovie?.original_name}
                                        </h2>

                                        <div className="flex items-center space-x-3 pt-2">
                                            <button className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded md:text-xl font-bold hover:bg-white/80 transition shadow-md">
                                                <Play size={24} fill="black" />
                                                Play
                                            </button>
                                            <AddToListButton movie={selectedMovie} />
                                        </div>
                                    </div>

                                    {trailerUrl && (
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="mr-10 md:mr-16 flex items-center justify-center p-2 md:p-3 border border-gray-400 rounded-full bg-[#181818]/60 text-white hover:bg-white/20 hover:border-white transition cursor-pointer"
                                        >
                                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 md:px-12 pb-12 pt-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                    <div className="md:col-span-2">
                                        <div className="flex items-center space-x-4 mb-4 text-sm md:text-base font-semibold drop-shadow">
                                            {selectedMovie.vote_average ? (
                                                <span className="text-green-400">{Math.round(selectedMovie.vote_average * 10)}% Match</span>
                                            ) : null}
                                            <span className="text-gray-300">{selectedMovie.release_date?.substring(0, 4) || selectedMovie.first_air_date?.substring(0, 4) || ""}</span>
                                            <span className="border border-gray-500 px-2 py-0.5 rounded text-gray-300 text-xs">HD</span>
                                        </div>

                                        <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm font-medium">
                                            {selectedMovie.overview}
                                        </p>
                                    </div>
                                    <div className="md:col-span-1 text-sm md:text-base text-gray-400 flex flex-col space-y-3">
                                        {movieDetails?.genres && movieDetails.genres.length > 0 && (
                                            <p><span className="text-gray-500">Genres:</span> {movieDetails.genres.map(g => g.name).join(", ")}</p>
                                        )}
                                        {movieDetails?.credits?.cast && movieDetails.credits.cast.length > 0 && (
                                            <p><span className="text-gray-500">Cast:</span> {movieDetails.credits.cast.slice(0, 4).map(c => c.name).join(", ")}</p>
                                        )}
                                        {!movieDetails && (
                                            <div className="animate-pulse space-y-3">
                                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-700 rounded w-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseModal}
                                style={{ zIndex: 9999 }}
                                className="absolute top-4 right-4 p-2 rounded-full bg-[#181818]/60 text-white hover:bg-white/40 transition-all cursor-pointer shadow-lg border border-white/20"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
