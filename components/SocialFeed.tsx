"use client";

import { useState, useEffect } from "react";
import FeedItem from "./FeedItem";

export default function SocialFeed() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchFeed() {
            try {
                const res = await fetch("/api/feed");
                if (res.ok) {
                    const data = await res.json();
                    setFeed(data.feed || []);
                } else {
                    setError("Failed to load feed");
                }
            } catch (err) {
                console.error(err);
                setError("Error fetching feed");
            } finally {
                setLoading(false);
            }
        }

        fetchFeed();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-8 border border-red-500/30 bg-red-500/10 rounded-xl text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    Live Feed
                </h2>
                <button className="text-xs text-zinc-500 hover:text-white transition-colors">
                    Filter
                </button>
            </div>

            {feed.length === 0 ? (
                <div className="text-center p-12 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <p className="text-zinc-400">Your feed is quiet.</p>
                    <p className="text-sm text-zinc-500 mt-2">Add some friends or write a review to get started!</p>
                </div>
            ) : (
                feed.map(item => (
                    <FeedItem key={item._id} item={item} />
                ))
            )}
        </div>
    );
}
