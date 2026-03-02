import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
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

        const rooms = await ChatRoom.find({ members: payload.userId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(rooms, { status: 200 });

    } catch (error) {
        console.error("GET Rooms Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Room name is required" }, { status: 400 });
        }

        const newRoom = await ChatRoom.create({
            name: name.trim(),
            creatorId: payload.userId,
            members: [payload.userId]
        });

        return NextResponse.json(newRoom, { status: 201 });

    } catch (error) {
        console.error("POST Room Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
