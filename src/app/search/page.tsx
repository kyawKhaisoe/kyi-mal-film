import { fetchFromTMDB } from "@/lib/fetchers";
import { requests } from "@/constants/tmdb";
import SearchGrid from "@/components/SearchGrid";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SearchPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q as string;

    if (!query) {
        return (
            <div className="pt-24 px-4 md:px-12 min-h-screen bg-[#141414] text-white">
                <h1 className="text-2xl md:text-3xl font-semibold mb-6">Search</h1>
                <p className="text-gray-400 text-lg">Please enter a search query.</p>
            </div>
        );
    }

    // Fetch movies from the TMDB multi-search or movie search API.
    const searchUrl = `${requests.fetchSearchMovies}${encodeURIComponent(query)}`;
    const results = await fetchFromTMDB(searchUrl);

    // Filter out results without images to maintain visually pleasing grid
    const filteredResults = results?.filter((item: any) => item.backdrop_path || item.poster_path) || [];

    return <SearchGrid searchQuery={query} movies={filteredResults} />;
}
