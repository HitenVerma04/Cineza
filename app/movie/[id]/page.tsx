import { getMovieDetails, getMovieCredits, getSimilarMovies, getImageUrl } from "@/lib/tmdb";
import { Star, Clock, Calendar } from "lucide-react";
import Image from "next/image";
import MovieGrid from "@/components/MovieGrid";
import { notFound } from "next/navigation";
import WatchlistButton from "@/components/WatchlistButton";
import WatchedButton from "@/components/WatchedButton";
import ReviewSection from "@/components/ReviewSection";
import MovieReactions from "@/components/MovieReactions";
import PlayTrailerButton from "@/components/PlayTrailerButton";
import FriendActivity from "@/components/FriendActivity";

export default async function MovieDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const movie = await getMovieDetails(params.id);

    if (!movie) {
        notFound();
    }

    const credits = await getMovieCredits(params.id);
    const similarMovies = await getSimilarMovies(params.id);

    const year = new Date(movie.release_date).getFullYear();

    return (
        <div className="bg-zinc-950 min-h-screen pb-16">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full lg:h-[70vh]">
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(movie.backdrop_path, 'original')}
                        alt={movie.title}
                        className="h-full w-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full">
                    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-8 items-end">
                            {/* Poster */}
                            <div className="hidden md:block shrink-0 w-64 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                                <img
                                    src={getImageUrl(movie.poster_path)}
                                    alt={movie.title}
                                    className="w-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-xs font-medium text-zinc-300"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-2">
                                    {movie.title}
                                </h1>

                                {movie.tagline && (
                                    <p className="text-xl text-zinc-400 italic mb-4">{movie.tagline}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-6 text-zinc-300 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        <span className="font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                                        <span className="text-zinc-500 text-sm">/ 10</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-5 h-5" />
                                        <span>{movie.runtime} min</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-5 h-5" />
                                        <span>{year}</span>
                                    </div>
                                </div>

                                {/* User actions: Watchlist, Review triggers */}
                                <div className="flex flex-wrap gap-4 mb-2">
                                    <PlayTrailerButton movieId={movie.id} />
                                    <WatchedButton movieId={params.id} />
                                    <WatchlistButton movieId={params.id} />
                                    <a href="#reviews" className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600 flex items-center gap-2">
                                        Write Review
                                    </a>
                                </div>

                                {/* Social Reactions */}
                                <MovieReactions movieId={params.id} />

                                <FriendActivity movieId={params.id} />

                                <div className="max-w-3xl mt-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        {movie.overview}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Cast Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-zinc-800 pb-2">Top Cast</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {credits?.cast.slice(0, 8).map((actor) => (
                                    <div key={actor.id} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                                        <div className="aspect-[2/3] w-full bg-zinc-800 relative">
                                            {actor.profile_path ? (
                                                <img
                                                    src={getImageUrl(actor.profile_path)}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-white text-sm truncate">{actor.name}</p>
                                            <p className="text-zinc-500 text-xs truncate mt-0.5">{actor.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* User Reviews Section */}
                        <section id="reviews" className="scroll-mt-24">
                            <ReviewSection movieId={params.id} />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6 tracking-tight border-b border-zinc-800 pb-2">Similar Movies</h2>
                            <div className="flex flex-col gap-4">
                                {similarMovies.slice(0, 4).map((m) => (
                                    <a key={m.id} href={`/movie/${m.id}`} className="flex gap-4 group">
                                        <div className="w-20 shrink-0 rounded-md overflow-hidden bg-zinc-800">
                                            {m.poster_path && (
                                                <img
                                                    src={getImageUrl(m.poster_path)}
                                                    alt={m.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-medium text-white group-hover:text-red-500 transition-colors line-clamp-2">{m.title}</h4>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                                <span className="text-zinc-400 text-xs">{m.vote_average.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
