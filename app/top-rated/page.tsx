import { getTopRatedMovies } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import { Star } from "lucide-react";

export default async function TopRatedPage() {
    // Fetch top rated movies
    const topRatedMovies = await getTopRatedMovies();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 border-b border-zinc-800 pb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="text-yellow-500 w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Top Rated Movies</h1>
                    <p className="text-zinc-400 text-lg">The greatest films of all time, according to critics and fans.</p>
                </div>
            </header>

            <MovieGrid movies={topRatedMovies} />
        </div>
    );
}
