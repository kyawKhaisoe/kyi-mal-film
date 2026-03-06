import { fetchFromTMDB } from "@/lib/fetchers";
import { requests, IMAGE_BASE_URL } from "@/constants/tmdb";
import { Movie } from "@/types/movie";
import { Play, Info } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";

interface HeroProps {
    fetchUrl?: string;
}

export default async function Hero({ fetchUrl = requests.fetchTrending }: HeroProps) {
    const trendingMovies: Movie[] = await fetchFromTMDB(fetchUrl);

    if (!trendingMovies || trendingMovies.length === 0) {
        return (
            <div className="h-[65vh] w-full flex flex-col items-center justify-center bg-zinc-900 text-white text-center px-4">
                <h1 className="text-2xl md:text-4xl font-bold mb-4">TMDB API Key Required</h1>
                <p className="text-gray-400 max-w-lg">
                    It looks like your TMDB API key is missing or invalid. Please check your <code className="bg-black px-2 py-1 rounded">.env.local</code> file and restart the development server.
                </p>
            </div>
        );
    }

    // Select a random movie from the trending list
    const randomMovie = trendingMovies[Math.floor(Math.random() * trendingMovies.length)];

    const truncate = (str: string, n: number) => {
        return str?.length > n ? str.substr(0, n - 1) + "..." : str;
    };

    return (
        <div
            className="relative h-[65vh] md:h-[85vh] text-white flex flex-col justify-center"
            style={{
                backgroundSize: "cover",
                backgroundImage: `url("${IMAGE_BASE_URL}${randomMovie?.backdrop_path || randomMovie?.poster_path}")`,
                backgroundPosition: "center top",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />
            <div className="absolute bottom-0 w-full h-[30vh] md:h-[20vh] bg-gradient-to-t from-[#141414] to-transparent z-0" />

            <div className="relative z-10 w-full pl-4 md:pl-12 pt-[140px] md:pt-[200px] h-full flex flex-col justify-start">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-2xl pb-2 drop-shadow-lg leading-tight">
                    {randomMovie?.title || randomMovie?.name || randomMovie?.original_name}
                </h1>

                <div className="flex space-x-3 mt-4 mb-4">
                    <button className="cursor-pointer font-bold text-black bg-white px-6 py-2 md:py-3 rounded flex items-center hover:bg-white/80 transition-all">
                        <Play className="w-5 h-5 mr-2 fill-black" />
                        Play
                    </button>
                    {randomMovie && <AddToListButton movie={randomMovie} />}
                    <button className="cursor-pointer font-semibold text-white bg-[rgba(109,109,109,0.7)] px-6 py-2 md:py-3 rounded flex items-center hover:bg-[rgba(109,109,110,0.4)] transition-all hidden md:flex">
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                    </button>
                </div>

                <p className="w-full max-w-xs md:max-w-lg lg:max-w-2xl leading-snug drop-shadow-md text-sm md:text-lg font-medium py-2">
                    {truncate(randomMovie?.overview, 150)}
                </p>
            </div>
        </div>
    );
}
