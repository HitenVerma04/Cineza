import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import { getMovieDetails } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

export default async function WatchlistPage() {
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");

    const payload = await verifyToken(token);
    if (!payload) redirect("/login");

    await dbConnect();

    // Fetch user's watchlist from the database
    const userWatchlist = await Watchlist.find({ userId: payload.userId })
        .sort({ createdAt: -1 })
        .lean();

    // Fetch TMDB details for each saved movie
    const watchlistedMovies = await Promise.all(
        userWatchlist.map(async (entry: any) => {
            const details = await getMovieDetails(entry.movieId);
            return details ? { ...details, wlStatus: entry.status } : null;
        })
    );

    // Filter out invalid or deleted movies
    const validWatchlist = watchlistedMovies.filter((w): w is NonNullable<typeof w> => w !== null);

    return (
        <div className="bg-[#0f171e] min-h-screen text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 border-b border-zinc-800 pb-6 border-opacity-50">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Watchlist</h1>
                    <p className="text-zinc-400">Movies you want to watch or have already seen.</p>
                </header>

                {validWatchlist.length === 0 ? (
                    <div className="py-20 text-center bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                        <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                        <p className="text-zinc-400 mb-6">Start exploring movies to add them to your list!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {validWatchlist.map((movie) => (
                            <MovieCard key={movie.id} movie={{ ...movie, id: movie.id || (movie as any).movieId, title: movie.title || "Unknown" } as any} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
