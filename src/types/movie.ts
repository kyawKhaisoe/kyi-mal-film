export interface Movie {
    id: number;
    title?: string;
    name?: string;
    original_name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type?: string;
    genre_ids: number[];
}

export interface MovieDetails extends Movie {
    genres?: { id: number; name: string }[];
    credits?: {
        cast: { id: number; name: string; character: string; profile_path: string | null }[];
    };
}
