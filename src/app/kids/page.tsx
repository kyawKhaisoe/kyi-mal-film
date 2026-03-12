import Hero from "@/components/Hero";
import Row from "@/components/Row";
import { requests } from "@/constants/tmdb";

export default function KidsMode() {
    return (
        <main className="relative min-h-screen pb-32 overflow-x-hidden bg-[#fafafa] md:bg-[#141414]">
            {/* Adding an explicit background style or keeping it consistent. Let's keep it consistent Netflix dark but maybe kids theme needs some fun styling. We'll stick to Dark theme but kids mode movies */}
            <Hero fetchUrl={requests.fetchKidsAnimation} />

            <div className="mt-[-40px] md:mt-[-80px] lg:mt-[-120px] relative z-20">
                <Row title="Popular Cartoons" fetchUrl={requests.fetchKidsAnimation} isLargeRow={true} />
                <Row title="Family TV Shows" fetchUrl={requests.fetchKidsFamilyTV} />
                <Row title="More Fun Animation" fetchUrl={requests.fetchKidsAnimation + "&page=2"} />
                <Row title="Shows for Kids" fetchUrl={requests.fetchKidsFamilyTV + "&page=2"} />
            </div>
        </main>
    );
}
