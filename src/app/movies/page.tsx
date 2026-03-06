import Hero from "@/components/Hero";
import Row from "@/components/Row";
import { requests } from "@/constants/tmdb";

export default function Movies() {
    return (
        <main className="relative min-h-screen pb-32 overflow-x-hidden">
            {/* Hero Banner for Movies using Popular Movies endpoint */}
            <Hero fetchUrl={requests.fetchPopularMovies} />

            <div className="mt-[-40px] md:mt-[-80px] lg:mt-[-120px] relative z-20">
                <Row title="Popular on Kyi Mal Film" fetchUrl={requests.fetchPopularMovies} isLargeRow={true} />
                <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
                <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} />
                <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies} />
                <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} />
                <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} />
            </div>
        </main>
    );
}
