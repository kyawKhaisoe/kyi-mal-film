declare module "movie-trailer" {
    function movieTrailer(
        movieName: string,
        options?: {
            id?: boolean;
            multi?: boolean;
            year?: number | string;
        }
    ): Promise<string | null>;

    export default movieTrailer;
}
