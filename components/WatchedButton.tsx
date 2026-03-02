"use client";

import { useState, useEffect } from "react";
import { Eye, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WatchedButton({ movieId }: { movieId: string }) {
    const [isWatched, setIsWatched] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch(`/api/watchlist/${movieId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.inWatchlist && data.entry?.status === "watched") {
                        setIsWatched(true);
                    }
                }
            } catch (error) {
                console.error("Failed to check watched status:", error);
            } finally {
                setLoading(false);
            }
        }
        checkStatus();
    }, [movieId]);

    const toggleWatched = async () => {
        setLoading(true);
        try {
            if (isWatched) {
                // If turning it off, we completely delete the entry.
                // Alternatively, we could revert to "watching", but deleting is safer to not litter 
                // the "To Watch" list if they just meant to untoggle it.
                const res = await fetch(`/api/watchlist/${movieId}`, { method: "DELETE" });
                if (res.ok) {
                    setIsWatched(false);
                    router.refresh();
                }
            } else {
                const res = await fetch(`/api/watchlist`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ movieId, status: "watched" }),
                });
                if (res.ok) {
                    setIsWatched(true);
                    router.refresh();
                } else if (res.status === 401) {
                    router.push("/login");
                }
            }
        } catch (error) {
            console.error("Failed to toggle watched status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <button disabled className="px-6 py-2.5 bg-zinc-800 text-zinc-500 font-semibold rounded-lg flex items-center gap-2 cursor-not-allowed border border-zinc-700">
                <Eye className="w-5 h-5" />
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={toggleWatched}
            className={`px-6 py-2.5 font-semibold rounded-lg transition-colors flex items-center gap-2 border ${isWatched
                ? "bg-green-600/20 text-green-400 border-green-500/50 hover:bg-green-600/30"
                : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 hover:border-zinc-600"
                }`}
        >
            {isWatched ? (
                <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Already Watched
                </>
            ) : (
                <>
                    <Eye className="w-5 h-5" />
                    Mark Watched
                </>
            )}
        </button>
    );
}
