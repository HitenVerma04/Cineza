import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Watchlist from "@/models/Watchlist";
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

        const watchlist = await Watchlist.find({ userId: userIdStr }).sort({ createdAt: -1 });

        return NextResponse.json(watchlist);
    } catch (error) {
        console.error("Watchlist GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { movieId, status } = await req.json();
        if (!movieId) return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });

        await dbConnect();

        let userIdStr = payload.userId as string;
        if (typeof payload.userId === 'object' && payload.userId !== null && (payload.userId as any).buffer) {
            userIdStr = Buffer.from(Object.values((payload.userId as any).buffer)).toString('hex');
        }

        const requestedStatus = status && ["watching", "watched"].includes(status) ? status : "watching";

        // Check if already in watchlist
        const existingEntry = await Watchlist.findOne({ userId: userIdStr, movieId });
        if (existingEntry) {
            // If it already exists, update its status
            existingEntry.status = requestedStatus;
            await existingEntry.save();
            return NextResponse.json(existingEntry, { status: 200 });
        }

        const newEntry = await Watchlist.create({
            userId: userIdStr,
            movieId,
            status: requestedStatus
        });

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error) {
        console.error("Watchlist POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
