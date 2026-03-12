export const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const requests = {
  fetchTrending: `/trending/all/week?api_key=${API_KEY}&language=en-US`,
  fetchNetflixOriginals: `/discover/tv?api_key=${API_KEY}&with_networks=213`,
  fetchTopRated: `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
  fetchActionMovies: `/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchComedyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?api_key=${API_KEY}&with_genres=27`,
  fetchRomanceMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
  fetchDocumentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99`,
  fetchSearchMovies: `/search/movie?api_key=${API_KEY}&language=en-US&query=`,
  // New Endpoints for Routing Pages
  fetchTopRatedTV: `/tv/top_rated?api_key=${API_KEY}&language=en-US`,
  fetchPopularTV: `/tv/popular?api_key=${API_KEY}&language=en-US`,
  fetchOnTheAirTV: `/tv/on_the_air?api_key=${API_KEY}&language=en-US`,
  fetchPopularMovies: `/movie/popular?api_key=${API_KEY}&language=en-US`,
  fetchUpcomingMovies: `/movie/upcoming?api_key=${API_KEY}&language=en-US`,
  fetchNowPlayingMovies: `/movie/now_playing?api_key=${API_KEY}&language=en-US`,
  fetchKidsAnimation: `/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16,10751`,
  fetchKidsFamilyTV: `/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=10751,16`,
};
