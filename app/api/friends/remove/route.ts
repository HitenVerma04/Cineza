import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get("friendId");

        if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
            return NextResponse.json(
                { error: "Invalid friend ID" },
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

        const friendUser = await User.findById(friendId);
        if (!friendUser) {
            return NextResponse.json({ error: "Friend user not found" }, { status: 404 });
        }

        // Remove from currentUser's friends
        if (currentUser.friends.includes(friendId)) {
            currentUser.friends = currentUser.friends.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== friendId
            );
            await currentUser.save();
        }

        // Remove from friendUser's friends
        if (friendUser.friends.includes(currentUserId)) {
            friendUser.friends = friendUser.friends.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== currentUserId
            );
            await friendUser.save();
        }

        return NextResponse.json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Remove friend error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
