import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";

export interface DiscoveryUser {
    id: string;
    name: string;
    profileImage?: string;
    totalFilms: number;
    totalReviews: number;
    recentPosters: { id: string; url: string }[];
}

export default function UserDiscoveryCard({ user }: { user: DiscoveryUser }) {
    // Format large numbers (e.g. 1500 -> 1.5K)
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    return (
        <div className="flex flex-col items-center group">
            {/* Circular Avatar with glow on hover */}
            <Link href={`/profile/${user.id}`} className="relative mb-3 block">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-zinc-500 transition-all duration-300 ring-2 ring-transparent group-hover:ring-zinc-800 ring-offset-2 ring-offset-[#0a0a0a]">
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-600">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </Link>

            {/* Name & Stats */}
            <div className="text-center mb-3">
                <Link href={`/profile/${user.id}`} className="block">
                    <h3 className="font-bold text-white text-base hover:text-blue-400 transition-colors">{user.name}</h3>
                </Link>
                <p className="text-xs text-zinc-500 font-medium tracking-wide mt-0.5">
                    {formatNumber(user.totalFilms)} films • {formatNumber(user.totalReviews)} reviews
                </p>
            </div>

            {/* Recent 4 Movie Posters Grid */}
            <div className="grid grid-cols-4 gap-0.5 sm:gap-1 w-full max-w-[12rem]">
                {/* Pad with empty boxes if less than 4 recent films */}
                {[0, 1, 2, 3].map((index) => {
                    const poster = user.recentPosters[index];
                    return (
                        <div key={index} className="aspect-[2/3] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 relative group/poster">
                            {poster ? (
                                <Link href={`/movie/${poster.id}`} className="block w-full h-full cursor-pointer">
                                    <img
                                        src={getImageUrl(poster.url, "w500")}
                                        alt={`Recent movie ${index + 1}`}
                                        className="w-full h-full object-cover group-hover/poster:opacity-60 transition-opacity"
                                    />
                                    {/* Subtle green tint overlay on hover, typical of Letterboxd */}
                                    <div className="absolute inset-0 bg-green-500/0 group-hover/poster:bg-green-500/10 transition-colors pointer-events-none"></div>
                                </Link>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
