import { UserCircle, Calendar, Film, Star, Users } from "lucide-react";
import FriendActionButton from "@/components/FriendActionButton";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";
import Watchlist from "@/models/Watchlist";
import { getMovieDetails, getImageUrl } from "@/lib/tmdb";
import Link from "next/link";
import { format } from "date-fns";
import ProfileStatsInteractive from "@/components/ProfileStatsInteractive";

export default async function ProfileView({ profileUserId, currentUserId }: { profileUserId: string, currentUserId: string | null }) {
    await dbConnect();

    // Fetch Profile User Data
    const user = await User.findById(profileUserId).populate("friends", "name profileImage").lean() as any;
    if (!user) {
        return <div className="text-white p-8">User not found</div>;
    }

    const isCurrentUser = profileUserId === currentUserId;

    // Determine Friend Status
    let friendStatus = "none"; // "none", "friends", "requested_by_me", "requested_by_them"
    if (!isCurrentUser && currentUserId) {
        const currentUser = await User.findById(currentUserId).lean() as any;
        if (currentUser?.friends?.some((id: any) => id.toString() === profileUserId)) {
            friendStatus = "friends";
        } else if (currentUser?.friendRequests?.some((id: any) => id.toString() === profileUserId)) {
            friendStatus = "requested_by_them";
        } else if (user.friendRequests?.some((id: any) => id.toString() === currentUserId)) {
            friendStatus = "requested_by_me";
        }
    }

    // Fetch Stats
    const [reviews, watchlist] = await Promise.all([
        Review.find({ userId: profileUserId }).sort({ createdAt: -1 }).limit(10).lean(),
        Watchlist.find({ userId: profileUserId }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const reviewCount = await Review.countDocuments({ userId: profileUserId });
    const watchlistCount = await Watchlist.countDocuments({ userId: profileUserId, status: "watching" });
    const watchedCount = await Watchlist.countDocuments({ userId: profileUserId, status: "watched" });
    const friendsCount = user.friends?.length || 0;

    // Fetch Movie Details for Recent Activity, Watched Grid, and To Watch Grid
    const watchedMoviesData = await Watchlist.find({ userId: profileUserId, status: "watched" })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();

    const toWatchMoviesData = await Watchlist.find({ userId: profileUserId, status: "watching" })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();

    const [recentActivity, watchedMovies, toWatchMovies] = await Promise.all([
        Promise.all([
            ...reviews.map(async (r: any) => {
                const m = await getMovieDetails(r.movieId);
                return { type: "review", date: r.createdAt, movie: m, review: r };
            }),
            ...watchlist.map(async (w: any) => {
                const m = await getMovieDetails(w.movieId);
                return { type: "watchlist", date: w.createdAt, movie: m, watchlist: w };
            })
        ]).then(results => results.flat()),
        Promise.all(watchedMoviesData.map(async (w: any) => {
            const m = await getMovieDetails(w.movieId);
            return m;
        })),
        Promise.all(toWatchMoviesData.map(async (w: any) => {
            const m = await getMovieDetails(w.movieId);
            return m;
        }))
    ]);

    // Sort combined activity by date
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestActivity = recentActivity.slice(0, 10);

    return (
        <div className="bg-[#0f171e] min-h-screen text-white pb-12">
            {/* Header */}
            <div className="bg-[#1a242f] border-b border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-bold text-zinc-500">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight">{user.name}</h1>
                            <p className="text-zinc-400 flex items-center justify-center md:justify-start gap-2 mt-2">
                                <Calendar className="w-4 h-4" />
                                Member since {format(new Date(user.createdAt || Date.now()), 'MMMM yyyy')}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                            {isCurrentUser ? (
                                <Link href="/settings" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-semibold transition-colors">
                                    Edit Profile
                                </Link>
                            ) : currentUserId ? (
                                <FriendActionButton profileUserId={profileUserId} initialStatus={friendStatus} />
                            ) : null}
                        </div>
                    </div>

                    {/* Stats (Interactive and Visible to Everyone) */}
                    <ProfileStatsInteractive
                        watchedCount={watchedCount}
                        reviewCount={reviewCount}
                        watchlistCount={watchlistCount}
                        friendsCount={friendsCount}
                        watchedMovies={watchedMovies}
                        toWatchMovies={toWatchMovies}
                        friends={user.friends || []}
                        reviewActivity={latestActivity.filter(a => a.type === 'review')}
                    />
                </div>
            </div>

            {/* Content Body (Friends Only) */}
            {isCurrentUser || friendStatus === "friends" ? (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Friends & Genres */}
                    <div className="space-y-8">
                        {/* Favorite Genres */}
                        <div className="bg-[#1a242f] rounded-xl p-6 border border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                Favorite Genres
                            </h2>
                            {user.topGenres && user.topGenres.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.topGenres.map((g: string) => (
                                        <span key={g} className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-300 border border-zinc-700">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">Not specified yet.</p>
                            )}
                        </div>

                        {/* Friends Snippet */}
                        <div className="bg-[#1a242f] rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Friends ({friendsCount})</h2>
                                <Link href={`/profile/${profileUserId}/friends`} className="text-xs text-blue-400 hover:text-blue-300">See all</Link>
                            </div>
                            {friendsCount > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {user.friends.slice(0, 6).map((f: any) => (
                                        <Link key={f._id} href={`/profile/${f._id}`} title={f.name} className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden hover:ring-2 ring-blue-500 transition-all">
                                            {f.profileImage ? (
                                                <img src={f.profileImage} alt={f.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-zinc-300">{f.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm">No friends added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Watched Movies Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Watched Films</h2>
                                {watchedCount > watchedMovies.length && (
                                    <span className="text-sm text-zinc-500">Showing {watchedMovies.length} of {watchedCount}</span>
                                )}
                            </div>
                            {watchedMovies.length === 0 ? (
                                <div className="p-8 text-center bg-[#1a242f] rounded-xl border border-gray-800">
                                    <Film className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-500 text-sm">No watched movies to display.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                    {watchedMovies.map((m) => (
                                        m ? (
                                            <Link href={`/movie/${m.id}`} key={m.id} className="group relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-800 border border-zinc-800 block hover:border-blue-500 transition-colors">
                                                {m.poster_path ? (
                                                    <img
                                                        src={getImageUrl(m.poster_path, 'w500')}
                                                        alt={m.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film className="w-6 h-6" /></div>
                                                )}
                                            </Link>
                                        ) : null
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent Activity Section */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">Recent Activity</h2>

                            {latestActivity.length === 0 ? (
                                <div className="p-12 text-center bg-[#1a242f] rounded-xl border border-gray-800">
                                    <UserCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-400">No recent activity.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {latestActivity.map((item, idx) => (
                                        <div key={idx} className="bg-[#1a242f] p-4 rounded-xl border border-gray-800 flex gap-4 hover:border-gray-600 transition-colors">
                                            <Link href={`/movie/${item.movie?.id}`} className="shrink-0 w-16 h-24 sm:w-20 sm:h-32 rounded bg-zinc-800 overflow-hidden">
                                                {item.movie?.poster_path ? (
                                                    <img src={getImageUrl(item.movie.poster_path, 'w500')} alt="poster" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film /></div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-2">
                                                    <p className="text-xs text-zinc-500 mb-1">{format(new Date(item.date), 'MMM d, yyyy')}</p>
                                                    {item.type === 'review' ? (
                                                        <p className="text-sm text-zinc-300">
                                                            Rated <Link href={`/movie/${item.movie?.id}`} className="font-bold text-white hover:underline">{item.movie?.title}</Link>
                                                            <span className="inline-flex items-center gap-1 ml-2 text-yellow-500 font-bold bg-black/30 px-1.5 py-0.5 rounded text-xs">
                                                                <Star className="w-3 h-3 fill-current" /> {(item as any).review.rating}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-zinc-300">
                                                            Added <Link href={`/movie/${item.movie?.id}`} className="font-bold text-white hover:underline">{item.movie?.title}</Link> to Watchlist
                                                        </p>
                                                    )}
                                                </div>
                                                {item.type === 'review' && (item as any).review.text && (
                                                    <p className="text-sm text-zinc-400 line-clamp-3 italic mt-2">
                                                        "{(item as any).review.text}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                    <div className="bg-[#1a242f] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-zinc-900">
                            <Users className="w-10 h-10 text-zinc-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">This account is private</h2>
                        <p className="text-zinc-400 max-w-sm mx-auto">
                            Add {user.name} as a friend to see their reviews, watchlist, and favorite cinema genres!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
