import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        let userIdStr = payload.userId as string;
        if (typeof payload.userId === 'object' && payload.userId !== null && (payload.userId as any).buffer) {
            userIdStr = Buffer.from(Object.values((payload.userId as any).buffer)).toString('hex');
        }

        // Populate user info if we want, but currently we just need the review.
        const reviews = await Review.find({ userId: userIdStr }).sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Reviews GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { movieId, rating, text } = await req.json();

        if (!movieId || !rating || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        await dbConnect();

        let userIdStr = payload.userId as string;
        if (typeof payload.userId === 'object' && payload.userId !== null && (payload.userId as any).buffer) {
            userIdStr = Buffer.from(Object.values((payload.userId as any).buffer)).toString('hex');
        }

        // Check if review already exists for this user and movie
        const existingReview = await Review.findOne({ userId: userIdStr, movieId });
        if (existingReview) {
            return NextResponse.json({ error: "You have already reviewed this movie" }, { status: 400 });
        }

        const newReview = await Review.create({
            userId: userIdStr,
            movieId,
            rating,
            text
        });

        // After creating a review, populate user data before returning
        await newReview.populate('userId', 'name');

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Review POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
