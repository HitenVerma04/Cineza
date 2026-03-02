"use client";

import { useState } from "react";
import { Search, UserCircle, Users, Bell, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import FriendActionButton from "./FriendActionButton";

interface UserData {
    _id: string;
    name: string;
    profileImage?: string;
    email?: string;
    status?: string;
}

export default function FriendsTabs({ friends, requests, currentUserId }: { friends: UserData[], requests: UserData[], currentUserId: string }) {
    const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const renderUserList = (users: UserData[], emptyMsg: string, showSearchAction = false) => {
        if (users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-[#1a242f] border border-gray-800 rounded-xl space-y-4 text-center">
                    <UserCircle className="w-12 h-12 text-zinc-600" />
                    <p className="text-zinc-400">{emptyMsg}</p>
                    {showSearchAction && (
                        <button onClick={() => setActiveTab('search')} className="text-blue-500 hover:underline">Find users to add</button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(u => (
                    <div key={u._id} className="bg-[#1a242f] rounded-xl p-4 border border-gray-800 flex items-center justify-between hover:border-gray-600 transition-colors">
                        <Link href={`/profile/${u._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                                {u.profileImage ? (
                                    <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-zinc-300">{u.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold truncate">{u.name}</h3>
                                {u.email && <p className="text-xs text-zinc-500 truncate">{u.email}</p>}
                            </div>
                        </Link>
                        <div className="shrink-0 ml-4">
                            <FriendActionButton profileUserId={u._id} initialStatus={u.status || (activeTab === "friends" ? "friends" : activeTab === "requests" ? "requested_by_them" : "none")} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl mb-8 overflow-x-auto hide-scroll">
                <button
                    onClick={() => setActiveTab("friends")}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "friends" ? "bg-[#1a242f] text-white shadow" : "text-zinc-400 hover:text-white"}`}
                >
                    <Users className="w-4 h-4" /> My Friends ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab("requests")}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "requests" ? "bg-[#1a242f] text-white shadow" : "text-zinc-400 hover:text-white"}`}
                >
                    <div className="relative">
                        <Bell className="w-4 h-4" />
                        {requests.length > 0 && (
                            <span className="absolute -top-1.5 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-zinc-900"></span>
                        )}
                    </div>
                    Requests ({requests.length})
                </button>
                <button
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === "search" ? "bg-[#1a242f] text-white shadow" : "text-zinc-400 hover:text-white"}`}
                >
                    <Search className="w-4 h-4" /> Find Users
                </button>
            </div>

            {/* Content */}
            <div className="mt-8">
                {activeTab === "friends" && renderUserList(friends, "You haven't added any friends yet.", true)}

                {activeTab === "requests" && renderUserList(requests, "No pending friend requests.", true)}

                {activeTab === "search" && (
                    <div className="space-y-6">
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name to find cinephiles..."
                                className="w-full bg-[#1a242f] border border-gray-800 text-white rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow text-lg"
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !searchQuery.trim()}
                                className="absolute inset-y-2 right-2 px-6 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-full transition-colors"
                            >
                                {isSearching ? "..." : "Search"}
                            </button>
                        </form>

                        {searchResults.length > 0 ? (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold mb-4">Results</h3>
                                {renderUserList(searchResults, "")}
                            </div>
                        ) : searchQuery && !isSearching ? (
                            <p className="text-center text-zinc-500 mt-8">No results found for "{searchQuery}"</p>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
