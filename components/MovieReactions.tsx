"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface ReactionsData {
    counts: {
        mind_blown: number;
        emotional: number;
        fun_watch: number;
    };
    total: number;
    trendingSentiment: string | null;
    userReaction: string | null;
}

export default function MovieReactions({ movieId }: { movieId: string }) {
    const [data, setData] = useState<ReactionsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const fetchReactions = async () => {
        try {
            const res = await fetch(`/api/reactions?movieId=${movieId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch reactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReactions();
    }, [movieId]);

    const triggerEmojis = (type: string, event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        const emojiMap: Record<string, string> = {
            mind_blown: '🔥',
            emotional: '😭',
            fun_watch: '🍿'
        };

        const scalar = 2.5; // Bigger emojis
        const emoji = confetti.shapeFromText({ text: emojiMap[type] || '⭐️', scalar });

        confetti({
            particleCount: 20,
            spread: 60,
            origin: { x, y },
            shapes: [emoji],
            scalar,
            gravity: 0.6,
            ticks: 100, // Duration
            disableForReducedMotion: true
        });
    };

    const handleReact = async (type: string, event: React.MouseEvent<HTMLButtonElement>) => {
        if (submitting) return;

        // Optimistically throw confetti if activating (not toggling off)
        if (data?.userReaction !== type) {
            triggerEmojis(type, event);
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId, type }),
            });

            if (res.ok) {
                fetchReactions(); // Refetch to get fresh counts and user status
            } else if (res.status === 401) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to react", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) {
        return <div className="animate-pulse flex gap-4 h-12 bg-zinc-800/50 rounded-lg w-full max-w-md"></div>;
    }

    const { counts, userReaction, trendingSentiment } = data;

    // Helper for soft button styling
    const getBtnStyle = (type: string, activeColor: string, hoverColor: string, isTrending: boolean) => {
        const isActive = userReaction === type;

        // Base styling for the new "softer" requirement: larger padding, rounded-2xl, subtle borders
        let classes = "flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl transition-all duration-300 border backdrop-blur-sm ";

        if (isActive) {
            // Active state: glowing, semi-transparent background, bright colored border
            classes += `bg-${activeColor}-500/20 border-${activeColor}-500/50 text-white shadow-lg shadow-${activeColor}-500/10 scale-105 z-10`;
        } else {
            // Inactive state: very subtle border, zinc background, hovering brings out color softly
            classes += `bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-${hoverColor}-500/10 hover:border-${hoverColor}-500/30 hover:text-zinc-200`;
        }

        return classes;
    };

    return (
        <div className="w-full max-w-xl my-8">
            {/* Trending Sentiment Banner */}
            {trendingSentiment && trendingSentiment !== "null" && (
                <div className="mb-4 inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                    <span className="text-zinc-400">Trending Sentiment:</span>
                    <span className="text-white flex items-center gap-1">
                        {trendingSentiment === "mind_blown" && <>🔥 <span className="text-orange-400">Mind Blown</span></>}
                        {trendingSentiment === "emotional" && <>😭 <span className="text-blue-400">Emotional</span></>}
                        {trendingSentiment === "fun_watch" && <>🍿 <span className="text-yellow-400">Fun Watch</span></>}
                    </span>
                </div>
            )}

            {/* Reaction Buttons */}
            <div className="flex gap-3 sm:gap-4 relative">

                {/* Mind Blown Button */}
                <button
                    onClick={(e) => handleReact("mind_blown", e)}
                    disabled={submitting}
                    className={getBtnStyle("mind_blown", "orange", "orange", trendingSentiment === "mind_blown")}
                >
                    <span className="text-3xl mb-1 filter drop-shadow-sm">🔥</span>
                    <span className="text-xs font-semibold tracking-wide">Mind Blown</span>
                    <span className="text-[10px] font-bold opacity-70 bg-black/40 px-2 py-0.5 rounded-full mt-1">{counts.mind_blown}</span>
                </button>

                {/* Emotional Button */}
                <button
                    onClick={(e) => handleReact("emotional", e)}
                    disabled={submitting}
                    className={getBtnStyle("emotional", "blue", "blue", trendingSentiment === "emotional")}
                >
                    <span className="text-3xl mb-1 filter drop-shadow-sm">😭</span>
                    <span className="text-xs font-semibold tracking-wide">Emotional</span>
                    <span className="text-[10px] font-bold opacity-70 bg-black/40 px-2 py-0.5 rounded-full mt-1">{counts.emotional}</span>
                </button>

                {/* Fun Watch Button */}
                <button
                    onClick={(e) => handleReact("fun_watch", e)}
                    disabled={submitting}
                    className={getBtnStyle("fun_watch", "yellow", "yellow", trendingSentiment === "fun_watch")}
                >
                    <span className="text-3xl mb-1 filter drop-shadow-sm">🍿</span>
                    <span className="text-xs font-semibold tracking-wide">Fun Watch</span>
                    <span className="text-[10px] font-bold opacity-70 bg-black/40 px-2 py-0.5 rounded-full mt-1">{counts.fun_watch}</span>
                </button>

            </div>
        </div>
    );
}
