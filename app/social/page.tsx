import dbConnect from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";
import Watchlist from "@/models/Watchlist";
import { getMovieDetails } from "@/lib/tmdb";
import UserDiscoveryCard, { DiscoveryUser } from "@/components/UserDiscoveryCard";
import SocialFeed from "@/components/SocialFeed";
import SocialTabs from "@/components/SocialTabs";

export const metadata = {
    title: "Social Dashboard | CineCircle",
    description: "Your movie timeline and discovery portal.",
};

export default async function SocialPage() {
    await dbConnect();

    // Fetch Discover Content
    const topReviewers = await Review.aggregate([
        { $group: { _id: "$userId", reviewCount: { $sum: 1 } } },
        { $sort: { reviewCount: -1 } },
        { $limit: 6 }
    ]);

    const discoveryUsers: DiscoveryUser[] = [];

    for (const rank of topReviewers) {
        const userId = rank._id;
        const user = await User.findById(userId).lean() as any;
        if (!user) continue;

        const totalFilms = await Watchlist.countDocuments({ userId, status: "watched" });
        const recentReviews = await Review.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();

        const recentMovieIds = new Set<string>();
        for (const review of recentReviews) {
            recentMovieIds.add(review.movieId);
            if (recentMovieIds.size >= 4) break;
        }

        if (recentMovieIds.size < 4) {
            const recentWatches = await Watchlist.find({ userId, status: "watched" }).sort({ updatedAt: -1 }).limit(10).lean();
            for (const watch of recentWatches) {
                recentMovieIds.add(watch.movieId);
                if (recentMovieIds.size >= 4) break;
            }
        }

        const posterPromises = Array.from(recentMovieIds).map(async (id) => {
            try {
                const movie = await getMovieDetails(id);
                if (movie && movie.poster_path) return { id, url: movie.poster_path };
            } catch (error) {
                console.error(`Failed to fetch poster for movie ${id}`);
            }
            return null;
        });

        const posters = (await Promise.all(posterPromises)).filter((p) => p !== null) as { id: string, url: string }[];

        discoveryUsers.push({
            id: user._id.toString(),
            name: user.name,
            profileImage: user.profileImage,
            totalFilms: totalFilms || Math.floor(rank.reviewCount * 1.5),
            totalReviews: rank.reviewCount,
            recentPosters: posters
        });
    }

    const discoverContent = discoveryUsers.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl mx-auto">
            <p className="text-zinc-500">No active members found. Be the first to review a movie!</p>
        </div>
    ) : (
        <div className="flex flex-wrap justify-center sm:justify-between items-start gap-8 sm:gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 place-items-center">
            {discoveryUsers.map((user) => (
                <UserDiscoveryCard key={user.id} user={user} />
            ))}
        </div>
    );

    return (
        <div className="bg-[#0f1115] min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Social Hub</h1>
                    <p className="text-zinc-400">See what your friends are watching, or discover popular members.</p>
                </div>

                <SocialTabs
                    feedContent={<SocialFeed />}
                    discoverContent={discoverContent}
                />

            </div>
        </div>
    );
}
