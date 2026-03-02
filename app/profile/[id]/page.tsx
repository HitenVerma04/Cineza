import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import ProfileView from "@/components/ProfileView";

export default async function OtherUserProfilePage({ params }: { params: { id: string } }) {
    const token = cookies().get("token")?.value;

    let currentUserId = null;
    if (token) {
        const payload = await verifyToken(token);
        if (payload && payload.userId) {
            currentUserId = payload.userId as string;
        }
    }

    return <ProfileView profileUserId={params.id} currentUserId={currentUserId} />;
}
