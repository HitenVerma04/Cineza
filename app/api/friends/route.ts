import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        const token = cookies().get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const currentUserId = payload.userId;

        await dbConnect();

        const user = await User.findById(currentUserId)
            .populate("friends", "_id name email")
            .populate("friendRequests", "_id name email");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            friends: user.friends || [],
            friendRequests: user.friendRequests || [],
        });
    } catch (error) {
        console.error("Get friends error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
