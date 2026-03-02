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

        const { reviewId, text } = await req.json();

        if (!reviewId || !text) {
            return NextResponse.json({ error: "Review ID and text are required" }, { status: 400 });
        }

        await dbConnect();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const userId = payload.userId;

        // Add the comment
        review.comments.push({
            userId,
            text,
            createdAt: new Date()
        });

        await review.save();

        return NextResponse.json({
            message: "Comment added",
            commentsCount: review.comments.length
        }, { status: 201 });

    } catch (error) {
        console.error("Comment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
