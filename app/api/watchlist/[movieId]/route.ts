import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: { movieId: string } }) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ inWatchlist: false });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ inWatchlist: false });

        await dbConnect();

        let userIdStr = payload.userId as string;
        if (typeof payload.userId === 'object' && payload.userId !== null && (payload.userId as any).buffer) {
            userIdStr = Buffer.from(Object.values((payload.userId as any).buffer)).toString('hex');
        }

        const entry = await Watchlist.findOne({ userId: userIdStr, movieId: params.movieId });

        return NextResponse.json({ inWatchlist: !!entry, entry });
    } catch (error) {
        console.error("Watchlist GET status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { movieId: string } }) {
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

        await Watchlist.findOneAndDelete({ userId: userIdStr, movieId: params.movieId });

        return NextResponse.json({ message: "Removed from watchlist" });
    } catch (error) {
        console.error("Watchlist DELETE Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
