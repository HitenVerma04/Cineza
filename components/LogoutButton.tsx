"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                router.push("/login");
                router.refresh();
            }
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition-colors flex items-center"
            title="Log Out"
        >
            <LogOut size={22} strokeWidth={1.5} />
        </button>
    );
}
