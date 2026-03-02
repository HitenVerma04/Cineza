import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
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
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Verify room
        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Add user to room
        if (!room.members.includes(userId)) {
            room.members.push(userId);
            await room.save();
        }

        return NextResponse.json({ message: "User added successfully" }, { status: 200 });

    } catch (error) {
        console.error("POST Add Room Member Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
