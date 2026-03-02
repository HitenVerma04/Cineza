import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
    try {
        await dbConnect();

        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { roomId } = params;

        // Verify room exists and user is a member
        const room: any = await ChatRoom.findById(roomId).populate("members", "name profileImage").lean();
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const isMember = room.members.some((m: any) => m._id.toString() === payload.userId);
        if (!isMember && room.creatorId.toString() !== payload.userId) {
            return NextResponse.json({ error: "Not a member of this room" }, { status: 403 });
        }

        return NextResponse.json(room.members, { status: 200 });

    } catch (error) {
        console.error("GET Room Members Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
