"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Camera, Check, Loader2 } from "lucide-react";

// Predefined set of popular genres for the tag selector
const AVAILABLE_GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Science Fiction", "Thriller", "War", "Western"
];

export default function SettingsForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [topGenres, setTopGenres] = useState<string[]>([]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/users/profile");
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name || "");
                    setProfileImage(data.profileImage || "");
                    setTopGenres(data.topGenres || []);
                } else {
                    setError("Failed to load profile details.");
                }
            } catch (err) {
                setError("An error occurred while loading profile.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const toggleGenre = (genre: string) => {
        setTopGenres(prev => {
            if (prev.includes(genre)) {
                return prev.filter(g => g !== genre);
            } else {
                if (prev.length >= 5) return prev; // Max 5 genres
                return [...prev, genre];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsSaving(true);

        try {
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, profileImage, topGenres })
            });

            if (res.ok) {
                setSuccessMsg("Profile updated successfully!");
                setTimeout(() => {
                    router.push("/profile");
                    router.refresh();
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile.");
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm">{error}</div>}
            {successMsg && <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 rounded text-sm flex items-center gap-2"><Check className="w-4 h-4" /> {successMsg}</div>}

            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 shadow-inner flex items-center justify-center">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="w-12 h-12 text-zinc-500" />
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Profile Image URL</label>
                    <input
                        type="url"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-zinc-500">Provide a direct link to a public image. (Square crops work best)</p>
                </div>
            </div>

            {/* Name Section */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Display Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Favorite Genres Section */}
            <div className="space-y-3 pb-6 border-b border-zinc-800">
                <div className="flex justify-between items-end">
                    <label className="block text-sm font-medium text-zinc-300">Favorite Genres</label>
                    <span className="text-xs text-zinc-500">{topGenres.length} / 5 selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map(genre => {
                        const isSelected = topGenres.includes(genre);
                        return (
                            <button
                                key={genre}
                                type="button"
                                onClick={() => toggleGenre(genre)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                                    }`}
                            >
                                {genre}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-zinc-500">Pick up to 5 of your favorite genres to display on your profile.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
