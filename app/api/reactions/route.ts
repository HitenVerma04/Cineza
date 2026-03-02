import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Reaction from "@/models/Reaction";

// Fetch aggregated reactions and the logged-in user's reaction for a movie
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const movieId = url.searchParams.get("movieId");

        if (!movieId) {
            return NextResponse.json({ error: "Missing movieId" }, { status: 400 });
        }

        await dbConnect();

        // Count all reactions for this movie using Mongoose aggregate
        const reactionCounts = await Reaction.aggregate([
            { $match: { movieId: movieId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Format to a friendly object { mind_blown: X, emotional: Y, fun_watch: Z }
        const counts = {
            mind_blown: 0,
            emotional: 0,
            fun_watch: 0,
        };

        let total = 0;
        let highest = { type: null as string | null, count: 0 };

        reactionCounts.forEach((r) => {
            const typeValue = r._id as keyof typeof counts;
            counts[typeValue] = r.count;
            total += r.count;
            if (r.count > highest.count) {
                highest = { type: typeValue, count: r.count };
            }
        });

        const token = req.cookies.get("token")?.value;
        let userReaction = null;

        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                const userReactDoc = await Reaction.findOne({ movieId, userId: payload.userId }).lean() as any;
                if (userReactDoc) {
                    userReaction = userReactDoc.type;
                }
            }
        }

        return NextResponse.json({
            counts,
            total,
            trendingSentiment: highest.count > total * 0.4 ? highest.type : null, // Need at least 40% majority to declare a strong sentiment
            userReaction
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Reactions Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Toggle a reaction for the logged-in user
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

        const { movieId, type } = await req.json();

        if (!movieId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!["mind_blown", "emotional", "fun_watch"].includes(type)) {
            return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
        }

        await dbConnect();

        const userId = payload.userId;

        // Check if reaction already exists
        const existingReaction = await Reaction.findOne({ userId, movieId });

        if (existingReaction) {
            if (existingReaction.type === type) {
                // User clicked the same reaction, so toggle it off (delete)
                await Reaction.findByIdAndDelete(existingReaction._id);
                return NextResponse.json({ message: "Reaction removed", userReaction: null }, { status: 200 });
            } else {
                // Change the reaction type
                existingReaction.type = type;
                await existingReaction.save();
                return NextResponse.json({ message: "Reaction updated", userReaction: type }, { status: 200 });
            }
        } else {
            // Create new reaction
            const newReaction = new Reaction({ userId, movieId, type });
            await newReaction.save();
            return NextResponse.json({ message: "Reaction added", userReaction: type }, { status: 201 });
        }

    } catch (error) {
        console.error("Toggle Reaction Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
