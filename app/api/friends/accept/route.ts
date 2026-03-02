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

        // Verify request exists
        if (!currentUser.friendRequests.includes(requesterUserId)) {
            return NextResponse.json({ error: "No friend request found" }, { status: 400 });
        }

        const requesterUser = await User.findById(requesterUserId);
        if (!requesterUser) {
            return NextResponse.json({ error: "Requester not found" }, { status: 404 });
        }

        // Add to friends, remove from friendRequests
        currentUser.friends.push(requesterUserId);
        currentUser.friendRequests = currentUser.friendRequests.filter(
            (id: mongoose.Types.ObjectId) => id.toString() !== requesterUserId
        );
        await currentUser.save();

        // Add to requester's friends too
        if (!requesterUser.friends.includes(currentUserId)) {
            requesterUser.friends.push(currentUserId);
            await requesterUser.save();
        }

        return NextResponse.json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Accept friend request error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
