const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
    vote_count?: number;
}

export interface MovieDetails extends Movie {
    runtime: number;
    genres: { id: number; name: string }[];
    status: string;
    tagline: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface MovieCredits {
    id: number;
    cast: CastMember[];
}

interface TMDBResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

/**
 * Generic fetch function for TMDB endpoints
 */
async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB API Key is missing. Please set NEXT_PUBLIC_TMDB_API_KEY in .env.local');
    }

    const urlParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'en-US',
        ...params,
    });

    const url = `${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`;

    const response = await fetch(url, {
        // We can use Next.js fetch caching here if needed in the future
        next: { revalidate: 3600 } // Cache for 1 hour by default
    });

    if (!response.ok) {
        console.error(`TMDB API Error (${response.status}):`, await response.text());
        throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetches the current trending movies (day or week window)
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`);
        return data.results;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}

/**
 * Fetches the top rated movies
 */
export async function getTopRatedMovies(page: number = 1): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<TMDBResponse<Movie>>(`/movie/top_rated`, {
            page: page.toString()
        });
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        return [];
    }
}

/**
 * Searches for movies by a text query
 */
export async function searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<TMDBResponse<Movie>>(`/search/movie`, {
            query,
            page: page.toString(),
            include_adult: 'false'
        });
        return data.results;
    } catch (error) {
        console.error(`Error searching movies for "${query}":`, error);
        return [];
    }
}

/**
 * Gets the standard image URL given a poster or backdrop path
 */
export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg'; // We can add a local placeholder image later
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Fetches detailed info for a single movie
 */
export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
    try {
        return await fetchTMDB<MovieDetails>(`/movie/${id}`);
    } catch (error) {
        console.error(`Error fetching details for movie ${id}:`, error);
        return null;
    }
}

/**
 * Fetches cast and crew for a movie
 */
export async function getMovieCredits(id: string): Promise<MovieCredits | null> {
    try {
        return await fetchTMDB<MovieCredits>(`/movie/${id}/credits`);
    } catch (error) {
        console.error(`Error fetching credits for movie ${id}:`, error);
        return null;
    }
}

/**
 * Fetches similar movies
 */
export async function getSimilarMovies(id: string): Promise<Movie[]> {
    try {
        const data = await fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/similar`);
        return data.results;
    } catch (error) {
        console.error(`Error fetching similar movies for ${id}:`, error);
        return [];
    }
}

export interface Video {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
}

/**
 * Fetches videos (trailers, teasers, etc.) for a movie
 */
export async function getMovieVideos(id: string): Promise<Video[]> {
    try {
        const data = await fetchTMDB<TMDBResponse<Video>>(`/movie/${id}/videos`);
        return data.results;
    } catch (error) {
        console.error(`Error fetching videos for movie ${id}:`, error);
        return [];
    }
}

export interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    known_for_department: string;
    popularity: number;
}

export interface PersonMovieCredit {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    popularity: number;
    character: string;
}

interface PersonCreditsResponse {
    cast: PersonMovieCredit[];
}

/**
 * Fetches details for a specific person (actor/crew)
 */
export async function getPersonDetails(id: string): Promise<PersonDetails | null> {
    try {
        return await fetchTMDB<PersonDetails>(`/person/${id}`);
    } catch (error) {
        console.error(`Error fetching person details for ${id}:`, error);
        return null;
    }
}

/**
 * Fetches the combined credits (movies/tv) for a specific person
 */
export async function getPersonMovieCredits(id: string): Promise<PersonMovieCredit[]> {
    try {
        const data = await fetchTMDB<PersonCreditsResponse>(`/person/${id}/movie_credits`);
        // Sort by popularity and return the top ones
        return data.cast.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
        console.error(`Error fetching person credits for ${id}:`, error);
        return [];
    }
}
