import Hero from "@/components/Hero";
import Row from "@/components/Row";
import { requests } from "@/constants/tmdb";

export default function TVShows() {
    return (
        <main className="relative min-h-screen pb-32 overflow-x-hidden">
            {/* Hero Banner for TV Shows using the Trending TV or Top Rated endpoint */}
            <Hero fetchUrl={requests.fetchTopRatedTV} />

            <div className="mt-[-40px] md:mt-[-80px] lg:mt-[-120px] relative z-20">
                <Row title="Top Rated TV Shows" fetchUrl={requests.fetchTopRatedTV} isLargeRow={true} />
                <Row title="Popular TV Shows" fetchUrl={requests.fetchPopularTV} />
                <Row title="On The Air" fetchUrl={requests.fetchOnTheAirTV} />
                {/* Reusing existing Netflix Originals as it's primarily TV series */}
                <Row title="KYI MAL ORIGINALS" fetchUrl={requests.fetchNetflixOriginals} />
            </div>
        </main>
    );
}
