import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import User from "@/models/User";
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
        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const memberIds = room.members.map((id: any) => id.toString());
        if (!memberIds.includes(payload.userId)) {
            return NextResponse.json({ error: "Not a member of this room" }, { status: 403 });
        }

        // Fetch users who are NOT in the members array
        const availableUsers = await User.find({
            _id: { $nin: room.members }
        })
            .select("name profileImage")
            .limit(50)
            .lean();

        return NextResponse.json(availableUsers, { status: 200 });

    } catch (error) {
        console.error("GET Available Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
