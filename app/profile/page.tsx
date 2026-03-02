import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";

export default async function MyProfilePage() {
    const token = cookies().get("token")?.value;
    if (!token) redirect("/login");

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) redirect("/login");

    return <ProfileView profileUserId={payload.userId as string} currentUserId={payload.userId as string} />;
}
