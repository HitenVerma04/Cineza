import Link from "next/link";
import { Star } from "lucide-react";
import { getTrendingMovies, getMovieDetails, getTopRatedMovies, getMovieCredits, getPersonDetails, getPersonMovieCredits } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import TrendingSection from "@/components/TrendingSection";
import TrendingHero from "@/components/TrendingHero";
import SocialFeed from "@/components/SocialFeed";
import WatchlistButton from "@/components/WatchlistButton";
import dbConnect from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import Review from "@/models/Review";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");

    const payload = await verifyToken(token);
    if (!payload) redirect("/login");

    await dbConnect();

    // Fetch real data
    const [trendingMovies, userWatchlist, userReviews] = await Promise.all([
        getTrendingMovies('day'),
        Watchlist.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean(),
        Review.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean()
    ]);

    // Fetch enriched data for top 5 trending movies for the synchronized Hero section
    const top5Trending = trendingMovies.slice(0, 5);
    const trendingItems = await Promise.all(
        top5Trending.map(async (movie) => {
            // Fetch detailed movie info to get genres
            const fullMovieDetails = await getMovieDetails(movie.id.toString());

            // Fetch Cast
            const credits = await getMovieCredits(movie.id.toString());
            const topCast = credits?.cast?.[0];

            let personDetails = null;
            let personCredits = null;

            if (topCast) {
                // Fetch person details and top movies they are known for
                const [pDetails, pCredits] = await Promise.all([
                    getPersonDetails(topCast.id.toString()),
                    getPersonMovieCredits(topCast.id.toString())
                ]);
                personDetails = pDetails;
                personCredits = pCredits.slice(0, 3); // Get top 3
            }

            return {
                movie: fullMovieDetails || movie, // fallback to basic movie if details fail
                credits,
                personDetails,
                personCredits
            };
        })
    );

    // Enhance watchlist with TMDB movie details
    const watchlistedMovies = await Promise.all(
        userWatchlist.map(async (entry: any) => {
            const details = await getMovieDetails(entry.movieId);
            return details ? { ...details, wlStatus: entry.status } : null;
        })
    );
    const validWatchlist = watchlistedMovies.filter(Boolean);

    // Enhance reviews with TMDB movie titles
    const reviewedMovies = await Promise.all(
        userReviews.map(async (review: any) => {
            const details = await getMovieDetails(review.movieId);
            return details ? { ...review, movieTitle: details.title } : review;
        })
    );


    // Fetch top rated movies for the widget
    const topRatedMovies = await getTopRatedMovies(1);


    return (
        <div className="bg-[#0f171e] min-h-screen text-white pb-12">
            {/* Animated Trending Hero Sections */}
            {trendingItems.length > 0 && <TrendingHero items={trendingItems} />}

            <div className="mx-auto mt-6 relative z-20 pb-12">
                {/* Extra container for IMDb constrained width on rows if needed, but MovieGrid handles its own px-4 */}

                {/* Trending Section with Time Toggle */}
                <TrendingSection initialMovies={trendingMovies.slice(1, 15)} />

                <section className="mt-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
                        <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-2">Top Rated Movies</h2>
                    </div>
                    <MovieGrid title="" movies={topRatedMovies} />
                </section>

                {/* My Watchlist Row */}
                {validWatchlist.length > 0 && (
                    <section>
                        <MovieGrid title="My Watchlist" movies={validWatchlist
                            .filter((w): w is NonNullable<typeof w> => w !== null)
                            .map(w => ({
                                ...w,
                                id: w.id || (w as any).movieId,
                                title: w.title || "Unknown"
                            })) as any[]} />
                    </section>
                )}

                {/* Recent Reviews Row */}
                {reviewedMovies.length > 0 && (
                    <section>
                        <div className="py-6 border-t border-gray-800 mt-8">
                            <h2 className="text-xl font-bold tracking-tight text-white mb-4 px-4 sm:px-6 lg:px-8">
                                Recent Reviews
                            </h2>
                            <div className="flex overflow-x-auto gap-4 pb-4 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory hide-scroll">
                                {reviewedMovies.slice(0, 10).map((review: any) => (
                                    <Link key={review._id} href={`/movie/${review.movieId}`} className="block w-[280px] shrink-0 snap-start">
                                        <div className="p-4 bg-[#1a242f] hover:bg-[#253241] rounded-md transition-colors h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-base font-bold text-white line-clamp-1">{review.movieTitle || 'Movie'}</h3>
                                                    <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded text-yellow-500 text-xs font-bold">
                                                        <Star className="w-3 h-3 fill-current" /> {review.rating}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 line-clamp-3 italic">"{review.text}"</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
