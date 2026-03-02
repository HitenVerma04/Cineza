"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Clock, UserMinus } from "lucide-react";

export default function FriendActionButton({ profileUserId, initialStatus }: { profileUserId: string, initialStatus: string }) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        setLoading(true);
        try {
            if (status === "none") {
                // Send Request
                const res = await fetch("/api/friends/request", {
                    method: "POST",
                    body: JSON.stringify({ targetUserId: profileUserId }),
                    headers: { "Content-Type": "application/json" }
                });
                if (res.ok) setStatus("requested_by_me");
            } else if (status === "requested_by_me") {
                // Cancel Request
                const res = await fetch("/api/friends/request", {
                    method: "DELETE",
                    body: JSON.stringify({ targetUserId: profileUserId }),
                    headers: { "Content-Type": "application/json" }
                });
                if (res.ok) setStatus("none");
            } else if (status === "requested_by_them") {
                // Accept Request
                const res = await fetch("/api/friends/accept", {
                    method: "POST",
                    body: JSON.stringify({ requesterUserId: profileUserId }),
                    headers: { "Content-Type": "application/json" }
                });
                if (res.ok) setStatus("friends");
            } else if (status === "friends") {
                // Remove Friend
                if (confirm("Are you sure you want to remove this friend?")) {
                    const res = await fetch(`/api/friends/remove?friendId=${profileUserId}`, {
                        method: "DELETE",
                    });
                    if (res.ok) setStatus("none");
                }
            }
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "friends") {
        return (
            <button onClick={handleAction} disabled={loading} className="px-4 py-2 bg-green-600/20 text-green-500 hover:bg-red-600/20 hover:text-red-500 rounded-full text-sm font-semibold transition-all flex items-center gap-2 group border border-green-500/30 hover:border-red-500/30">
                <span className="group-hover:hidden flex items-center gap-2"><UserCheck className="w-4 h-4" /> Friends</span>
                <span className="hidden group-hover:flex items-center gap-2"><UserMinus className="w-4 h-4" /> Unfriend</span>
            </button>
        );
    }

    if (status === "requested_by_me") {
        return (
            <button onClick={handleAction} disabled={loading} className="px-4 py-2 bg-zinc-800 hover:bg-red-900/40 text-zinc-300 hover:text-red-400 rounded-full text-sm font-semibold transition-all flex items-center gap-2 group border border-zinc-700 hover:border-red-500/50">
                <span className="group-hover:hidden flex items-center gap-2"><Clock className="w-4 h-4" /> Request Sent</span>
                <span className="hidden group-hover:flex items-center gap-2">Cancel</span>
            </button>
        );
    }

    if (status === "requested_by_them") {
        return (
            <button onClick={handleAction} disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                <UserCheck className="w-4 h-4" /> Accept Request
            </button>
        );
    }

    // Default "none"
    return (
        <button onClick={handleAction} disabled={loading} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transform hover:scale-[1.02]">
            <UserPlus className="w-4 h-4" /> Add Friend
        </button>
    );
}
