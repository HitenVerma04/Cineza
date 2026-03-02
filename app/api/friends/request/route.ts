import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
    try {
        const { targetUserId } = await request.json();

        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return NextResponse.json(
                { error: "Invalid target user ID" },
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

        if (currentUserId === targetUserId) {
            return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
        }

        await dbConnect();

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return NextResponse.json(
                { error: "Target user not found" },
                { status: 404 }
            );
        }

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already friends
        if (currentUser.friends.includes(targetUserId)) {
            return NextResponse.json({ error: "Already friends" }, { status: 400 });
        }

        // Check if request already sent
        if (targetUser.friendRequests.includes(currentUserId)) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 });
        }

        // Add to friendRequests of target user
        targetUser.friendRequests.push(currentUserId);
        await targetUser.save();

        return NextResponse.json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Send friend request error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { targetUserId } = await request.json();

        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return NextResponse.json({ error: "Invalid target user ID" }, { status: 400 });
        }

        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const currentUserId = payload.userId as string;

        await dbConnect();

        // Remove current user from target user's friend requests
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { friendRequests: currentUserId }
        });

        return NextResponse.json({ message: "Friend request cancelled successfully" });
    } catch (error) {
        console.error("Cancel friend request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
