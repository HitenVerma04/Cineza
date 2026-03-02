import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: { movieId: string } }) {
    try {
        await dbConnect();

        const token = req.cookies.get("token")?.value;
        let currentUserId = null;
        if (token) {
            const payload = await verifyToken(token);
            if (payload) currentUserId = payload.userId;
        }

        const reviews = await Review.find({ movieId: params.movieId })
            .populate("userId", "name profileImage")
            .populate("comments.userId", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();

        // Format to include hasLiked for the current user and count likes
        const formattedReviews = reviews.map((r: any) => ({
            ...r,
            likesCount: r.likes?.length || 0,
            hasLiked: currentUserId && r.likes ? r.likes.some((id: any) => id.toString() === currentUserId) : false,
        }));

        return NextResponse.json(formattedReviews, { status: 200 });

    } catch (error) {
        console.error("Reviews GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
