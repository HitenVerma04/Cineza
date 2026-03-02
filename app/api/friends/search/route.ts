import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ users: [] }, { status: 200 });
        }

        await dbConnect();

        // Find users matching the query, limit to 20
        const users = await User.find({
            name: { $regex: query, $options: "i" },
            _id: { $ne: payload.userId } // Exclude self
        }).select("name profileImage").limit(20).lean();

        // We also want to know the current user's friend status to render UI correctly
        const currentUser = await User.findById(payload.userId).lean() as any;
        const myFriends = currentUser?.friends?.map((id: any) => id.toString()) || [];
        const myRequests = currentUser?.friendRequests?.map((id: any) => id.toString()) || [];

        // In a real app we'd map this out optimally, here we just attach the lists
        // and let the client figure it out, OR we map the status per user here.
        const usersWithStatus = await Promise.all(users.map(async (u: any) => {
            const userIdStr = u._id.toString();
            let status = "none";

            if (myFriends.includes(userIdStr)) {
                status = "friends";
            } else if (myRequests.includes(userIdStr)) {
                status = "requested_by_them";
            } else {
                // Check if we requested them
                const targetUser = await User.findById(u._id).lean() as any;
                if (targetUser?.friendRequests?.some((id: any) => id.toString() === payload.userId)) {
                    status = "requested_by_me";
                }
            }

            return {
                ...u,
                status
            };
        }));

        return NextResponse.json({ users: usersWithStatus }, { status: 200 });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
