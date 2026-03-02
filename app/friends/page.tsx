import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import FriendsTabs from "@/components/FriendsTabs";

export default async function FriendsPage() {
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) redirect("/login");

    await dbConnect();

    // Fetch user and populate friends and friendRequests
    const currentUser = await User.findById(payload.userId)
        .populate("friends", "_id name profileImage email")
        .populate("friendRequests", "_id name profileImage email")
        .lean() as any;

    if (!currentUser) redirect("/login");

    // Clean up IDs for Client Component
    const friends = (currentUser.friends || []).map((f: any) => ({
        ...f,
        _id: f._id.toString()
    }));

    const requests = (currentUser.friendRequests || []).map((r: any) => ({
        ...r,
        _id: r._id.toString()
    }));

    return (
        <div className="bg-[#0f171e] min-h-screen text-white pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Circle</h1>
                    <p className="text-zinc-400">Connect with friends, see what they're watching, and debate movies.</p>
                </div>

                <FriendsTabs
                    friends={friends}
                    requests={requests}
                    currentUserId={payload.userId as string}
                />
            </div>
        </div>
    );
}
