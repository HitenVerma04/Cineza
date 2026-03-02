import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // Fetch latest 100 global messages
        const messages = await Message.find({ type: "global" })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("senderId", "name profileImage")
            .lean();

        // Return sorted oldest to newest for chat UI
        return NextResponse.json(messages.reverse());
    } catch (error) {
        console.error("Global Chat GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text } = await req.json();
        if (!text || !text.trim()) {
            return NextResponse.json({ error: "Message text is required" }, { status: 400 });
        }

        await dbConnect();

        let userIdStr = payload.userId as string;
        if (typeof payload.userId === 'object' && payload.userId !== null && (payload.userId as any).buffer) {
            userIdStr = Buffer.from(Object.values((payload.userId as any).buffer)).toString('hex');
        }

        const newMessage = await Message.create({
            senderId: userIdStr,
            type: "global",
            text: text.trim()
        });

        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "name profileImage").lean();

        return NextResponse.json(populatedMessage, { status: 201 });
    } catch (error) {
        console.error("Global Chat POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
