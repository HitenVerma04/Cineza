"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WatchlistButton({ movieId, variant = "default" }: { movieId: string, variant?: "default" | "icon" }) {
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch(`/api/watchlist/${movieId}`);
                if (res.ok) {
                    const data = await res.json();
                    setInWatchlist(data.inWatchlist);
                }
            } catch (error) {
                console.error("Failed to check watchlist status:", error);
            } finally {
                setLoading(false);
            }
        }
        checkStatus();
    }, [movieId]);

    const toggleWatchlist = async () => {
        setLoading(true);
        try {
            if (inWatchlist) {
                const res = await fetch(`/api/watchlist/${movieId}`, { method: "DELETE" });
                if (res.ok) {
                    setInWatchlist(false);
                    router.refresh(); // Refresh to update potentially dependent server components
                }
            } else {
                const res = await fetch(`/api/watchlist`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ movieId }),
                });
                if (res.ok) {
                    setInWatchlist(true);
                    router.refresh();
                } else if (res.status === 401) {
                    router.push("/login"); // Redirect to login if not authenticated
                }
            }
        } catch (error) {
            console.error("Failed to toggle watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <button disabled className="px-6 py-2.5 bg-zinc-800 text-zinc-500 font-semibold rounded-lg flex items-center gap-2 cursor-not-allowed">
                <Bookmark className="w-5 h-5" />
                Loading...
            </button>
        );
    }

    if (variant === "icon") {
        return (
            <button
                onClick={toggleWatchlist}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors backdrop-blur-md border ${inWatchlist
                        ? "bg-zinc-800/80 text-white border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600"
                        : "bg-gray-600/60 text-white border-transparent hover:bg-gray-500/60"
                    }`}
            >
                {inWatchlist ? (
                    <BookmarkCheck className="w-5 h-5 text-red-500" />
                ) : (
                    <span className="text-2xl leading-none flex items-center justify-center mb-1">+</span>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={toggleWatchlist}
            className={`px-6 py-2.5 font-semibold rounded-lg transition-colors flex items-center gap-2 ${inWatchlist
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-zinc-600"
                : "bg-red-600 hover:bg-red-500 text-white"
                }`}
        >
            {inWatchlist ? (
                <>
                    <BookmarkCheck className="w-5 h-5 text-red-500" />
                    In Watchlist
                </>
            ) : (
                <>
                    <Bookmark className="w-5 h-5" />
                    + Add to Watchlist
                </>
            )}
        </button>
    );
}
