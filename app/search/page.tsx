import { searchMovies } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import { Search } from "lucide-react";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams.q || "";

    // Server-side fetch
    const movies = query ? await searchMovies(query) : [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 border-b border-zinc-800 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                        <Search className="text-zinc-400 w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {query ? `Search results for "${query}"` : "Search Movies"}
                    </h1>
                </div>
                {query && (
                    <p className="text-zinc-400 text-sm">
                        Found {movies.length} movies matching your query.
                    </p>
                )}
            </header>

            {!query ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="w-16 h-16 text-zinc-700 mb-4" />
                    <h2 className="text-xl font-medium text-zinc-300">Enter a search term</h2>
                    <p className="text-zinc-500 mt-2">Find your favorite movies, actors, and directors.</p>
                </div>
            ) : movies.length > 0 ? (
                <MovieGrid movies={movies} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="w-16 h-16 text-zinc-700 mb-4" />
                    <h2 className="text-xl font-medium text-zinc-300">No results found</h2>
                    <p className="text-zinc-500 mt-2">We couldn't find any movies matching "{query}". Try another search term.</p>
                </div>
            )}
        </div>
    );
}
