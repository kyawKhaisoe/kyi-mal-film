import Hero from "@/components/Hero";
import Row from "@/components/Row";
import { requests } from "@/constants/tmdb";

export default function NewAndPopular() {
    return (
        <main className="relative min-h-screen pb-32 overflow-x-hidden">
            {/* Hero Banner for New & Popular using Upcoming Movies */}
            <Hero fetchUrl={requests.fetchUpcomingMovies} />

            <div className="mt-[-40px] md:mt-[-80px] lg:mt-[-120px] relative z-20">
                <Row title="Upcoming Movies" fetchUrl={requests.fetchUpcomingMovies} isLargeRow={true} />
                <Row title="Now Playing in Theaters" fetchUrl={requests.fetchNowPlayingMovies} />
                <Row title="Trending This Week" fetchUrl={requests.fetchTrending} />
                <Row title="Top Rated TV Shows" fetchUrl={requests.fetchTopRatedTV} />
            </div>
        </main>
    );
}
