import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { reviewId } = await req.json();

        if (!reviewId) {
            return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
        }

        await dbConnect();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const userId = payload.userId;
        const hasLiked = review.likes.includes(userId);

        if (hasLiked) {
            // Unlike
            review.likes = review.likes.filter((id: any) => id.toString() !== userId);
        } else {
            // Like
            review.likes.push(userId);
        }

        await review.save();

        return NextResponse.json({
            message: hasLiked ? "Unliked" : "Liked",
            likesCount: review.likes.length,
            hasLiked: !hasLiked
        }, { status: 200 });

    } catch (error) {
        console.error("Like Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
