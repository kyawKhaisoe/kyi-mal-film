import { fetchFromTMDB } from "@/lib/fetchers";
import { Movie } from "@/types/movie";
import RowUI from "./RowUI";

interface RowProps {
    title: string;
    fetchUrl: string;
    isLargeRow?: boolean;
}

export default async function Row({ title, fetchUrl, isLargeRow = false }: RowProps) {
    const movies: Movie[] = await fetchFromTMDB(fetchUrl);

    if (!movies || movies.length === 0) return null;

    return <RowUI title={title} movies={movies} isLargeRow={isLargeRow} />;
}
