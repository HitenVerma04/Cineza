"use client";

import { useState } from "react";
import { Activity, Compass } from "lucide-react";

export default function SocialTabs({ feedContent, discoverContent }: { feedContent: React.ReactNode, discoverContent: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");

    return (
        <div className="w-full">
            {/* Tabs Header */}
            <div className="flex justify-center mb-10">
                <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("feed")}
                        className={`min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === "feed" ? "bg-[#1a242f] text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <Activity className="w-4 h-4" /> Live Feed
                    </button>
                    <button
                        onClick={() => setActiveTab("discover")}
                        className={`min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === "discover" ? "bg-[#1a242f] text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <Compass className="w-4 h-4" /> Discover
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="w-full">
                {activeTab === "feed" ? feedContent : discoverContent}
            </div>
        </div>
    );
}
