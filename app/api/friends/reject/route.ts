import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
    try {
        const { requesterUserId } = await request.json();

        if (!requesterUserId || !mongoose.Types.ObjectId.isValid(requesterUserId)) {
            return NextResponse.json(
                { error: "Invalid requester user ID" },
                { status: 400 }
            );
        }

        const token = cookies().get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const currentUserId = payload.userId as string;

        await dbConnect();

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Remove from friendRequests
        if (currentUser.friendRequests.includes(requesterUserId)) {
            currentUser.friendRequests = currentUser.friendRequests.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== requesterUserId
            );
            await currentUser.save();
        }

        return NextResponse.json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Reject friend request error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
