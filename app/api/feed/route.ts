import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";
import Watchlist from "@/models/Watchlist";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await dbConnect();

        // 1. Get the current user to find their friends
        const currentUser = await User.findById(payload.userId).lean() as any;
        const friendIds = currentUser?.friends || [];

        // 2. Fetch Recent Friend Reviews
        const friendReviews = await Review.find({ userId: { $in: friendIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("userId", "name profileImage")
            .lean();

        // 3. Fetch Recent Friend Watchlist Activity (only marked as 'watched')
        const friendWatchlist = await Watchlist.find({
            userId: { $in: friendIds },
            status: "watched"
        })
            .sort({ updatedAt: -1, createdAt: -1 }) // Sort by when it was watched
            .limit(10)
            .populate("userId", "name profileImage")
            .lean();

        // 4. Fetch Global "Debates" (Reviews with > 0 comments from anyone, not just friends)
        // In a real app we'd filter for more comments, but for beta we'll take any commented review
        const globalDebates = await Review.find({
            "comments.0": { $exists: true },
            userId: { $ne: payload.userId } // Don't show our own in global feed
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "name profileImage")
            .lean();

        // 5. Fetch Global "Viral" / Popular Opinions (High rating + likes)
        const viralReviews = await Review.find({
            rating: { $gte: 4 },
            userId: { $ne: payload.userId }
            // If we had a large DB, we'd sort by `likes` size here, 
            // but Mongoose makes sorting by array size slightly tricky without aggregation.
            // For now, any recent 4+ star review from the community counts as a popular opinion.
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "name profileImage")
            .lean();

        // 6. Format and Aggregate the Feed

        let feed: any[] = [];

        // Format Friend Reviews
        friendReviews.forEach((r: any) => {
            feed.push({
                _id: r._id.toString(),
                reviewId: r._id.toString(),
                type: "friend_review",
                timestamp: r.createdAt,
                user: { id: r.userId._id, name: r.userId.name, profileImage: r.userId.profileImage },
                movieId: r.movieId,
                rating: r.rating,
                text: r.text,
                likesCount: r.likes?.length || 0,
                isLikedByMe: r.likes?.some((l: any) => l.toString() === payload.userId) || false,
                commentsCount: r.comments?.length || 0
            });
        });

        // Format Friend Watchlist
        friendWatchlist.forEach((w: any) => {
            feed.push({
                _id: w._id.toString() + "_watch", // avoid id collision if same movie
                type: "friend_watch",
                timestamp: w.updatedAt || w.createdAt,
                user: { id: w.userId._id, name: w.userId.name, profileImage: w.userId.profileImage },
                movieId: w.movieId,
            });
        });

        // Format Global Debates
        globalDebates.forEach((r: any) => {
            feed.push({
                _id: r._id.toString() + "_debate",
                reviewId: r._id.toString(),
                type: "global_debate",
                timestamp: r.createdAt,
                user: { id: r.userId._id, name: r.userId.name, profileImage: r.userId.profileImage },
                movieId: r.movieId,
                rating: r.rating,
                text: r.text,
                likesCount: r.likes?.length || 0,
                isLikedByMe: r.likes?.some((l: any) => l.toString() === payload.userId) || false,
                commentsCount: r.comments?.length || 0
            });
        });

        // Format Viral Reviews
        viralReviews.forEach((r: any) => {
            // Avoid duplicates if a review is both a debate and viral
            if (!feed.find(item => item._id === r._id.toString() || item._id === r._id.toString() + "_debate")) {
                feed.push({
                    _id: r._id.toString() + "_viral",
                    reviewId: r._id.toString(),
                    type: "global_viral",
                    timestamp: r.createdAt,
                    user: { id: r.userId._id, name: r.userId.name, profileImage: r.userId.profileImage },
                    movieId: r.movieId,
                    rating: r.rating,
                    text: r.text,
                    likesCount: r.likes?.length || 0,
                    isLikedByMe: r.likes?.some((l: any) => l.toString() === payload.userId) || false,
                    commentsCount: r.comments?.length || 0
                });
            }
        });

        // 7. Sort Feed Chronologically (Newest First)
        feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Trim to top 20 items to keep it fresh
        feed = feed.slice(0, 20);

        return NextResponse.json({ feed }, { status: 200 });

    } catch (error) {
        console.error("Feed API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
