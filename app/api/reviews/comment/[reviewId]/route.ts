import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function GET(
    req: Request,
    { params }: { params: { reviewId: string } }
) {
    try {
        await dbConnect();
        const { reviewId } = params;

        if (!reviewId) {
            return NextResponse.json({ error: "Review ID required" }, { status: 400 });
        }

        const review = await Review.findById(reviewId)
            .populate({
                path: "comments.userId",
                select: "name profileImage",
            })
            .lean() as any;

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Return the comments array sorted by oldest first to emulate a typical comment thread
        let comments = review.comments || [];
        comments = comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return NextResponse.json(comments, { status: 200 });
    } catch (error: any) {
        console.error("Fetch Comments Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
