import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { friendId: string } }) {
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

        const friendId = params.friendId;
        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return NextResponse.json({ error: "Invalid Friend ID" }, { status: 400 });
        }

        // Fetch messages between these two users
        const messages = await Message.find({
            type: "direct",
            $or: [
                { senderId: userIdStr, receiverId: friendId },
                { senderId: friendId, receiverId: userIdStr }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("senderId", "name profileImage")
            .lean();

        return NextResponse.json(messages.reverse());
    } catch (error) {
        console.error("Direct Chat GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { friendId: string } }) {
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

        const friendId = params.friendId;
        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return NextResponse.json({ error: "Invalid Friend ID" }, { status: 400 });
        }

        const newMessage = await Message.create({
            senderId: userIdStr,
            receiverId: friendId,
            type: "direct",
            text: text.trim()
        });

        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "name profileImage").lean();

        return NextResponse.json(populatedMessage, { status: 201 });
    } catch (error) {
        console.error("Direct Chat POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
