import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Watchlist from "@/models/Watchlist";
import Review from "@/models/Review";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function FriendActivity({ movieId }: { movieId: string }) {
    await dbConnect();

    const token = cookies().get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const currentUser = await User.findById(payload.userId).lean() as any;
    if (!currentUser || !currentUser.friends || currentUser.friends.length === 0) return null;

    const friendIds = currentUser.friends;

    // A friend has watched it if they have it in their watchlist as 'watched' OR they reviewed it.
    const watches = await Watchlist.find({
        movieId,
        userId: { $in: friendIds },
        status: "watched"
    }).lean();

    const reviews = await Review.find({
        movieId,
        userId: { $in: friendIds }
    }).lean();

    // Deduplicate friend IDs who have watched
    const watchedFriendIds = new Set<string>();
    watches.forEach(w => watchedFriendIds.add(w.userId.toString()));
    reviews.forEach(r => watchedFriendIds.add(r.userId.toString()));

    if (watchedFriendIds.size === 0) return null;

    // Fetch the friend details to show avatars/names
    const watchedFriends = await User.find({
        _id: { $in: Array.from(watchedFriendIds) }
    }).limit(3).lean() as any[];

    if (!watchedFriends || watchedFriends.length === 0) return null;

    const totalWatched = watchedFriendIds.size;

    return (
        <div className="flex items-center gap-3 mt-6 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 w-fit">
            <div className="flex -space-x-2">
                {watchedFriends.map((friend, i) => (
                    <Link href={`/profile/${friend._id.toString()}`} key={friend._id.toString()} className="relative z-10 inline-block w-8 h-8 rounded-full ring-2 ring-zinc-950 overflow-hidden bg-zinc-800 shrink-0 hover:ring-white transition-all">
                        {friend.profileImage ? (
                            <img src={friend.profileImage} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-zinc-700">
                                {friend.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
            <p className="text-sm text-zinc-300">
                <span className="font-semibold text-white">
                    <Link href={`/profile/${watchedFriends[0]._id.toString()}`} className="hover:underline">{watchedFriends[0].name}</Link>
                    {totalWatched > 1 && ` and ${totalWatched - 1} other${totalWatched - 1 > 1 ? 's' : ''}`}
                </span> watched this
            </p>
        </div>
    );
}
