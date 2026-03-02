"use client";

import { useState } from "react";
import { Film, Star, Calendar, Users, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ProfileStatsInteractive({
    watchedCount,
    reviewCount,
    watchlistCount,
    friendsCount,
    watchedMovies,
    toWatchMovies,
    friends,
    reviewActivity
}: any) {
    const [activeModal, setActiveModal] = useState<"watched" | "reviews" | "toWatch" | "friends" | null>(null);

    return (
        <>
            <div className="flex bg-zinc-900/50 rounded-xl p-6 gap-6 sm:gap-8 border border-zinc-800/50 shrink-0 shadow-inner flex-wrap justify-center w-full md:w-auto">
                <button
                    onClick={() => setActiveModal("watched")}
                    title="View Watched Movies"
                    className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer group focus:outline-none"
                >
                    <span className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{watchedCount}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-blue-400" /> Watched</span>
                </button>
                <div className="w-px h-12 bg-zinc-800 hidden sm:block"></div>
                <button
                    onClick={() => setActiveModal("reviews")}
                    title="View Reviews & Comments"
                    className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer group focus:outline-none"
                >
                    <span className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">{reviewCount}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> Reviews</span>
                </button>
                <div className="w-px h-12 bg-zinc-800 hidden sm:block"></div>
                <button
                    onClick={() => setActiveModal("toWatch")}
                    title="View Watchlist"
                    className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer group focus:outline-none"
                >
                    <span className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{watchlistCount}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-400" /> To Watch</span>
                </button>
                <div className="w-px h-12 bg-zinc-800 hidden sm:block"></div>
                <button
                    onClick={() => setActiveModal("friends")}
                    title="View Friends"
                    className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer group focus:outline-none"
                >
                    <span className="text-3xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{friendsCount}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-green-400" /> Friends</span>
                </button>
            </div>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a242f] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f171e] shrink-0">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                {activeModal === "watched" && (
                                    <><Film className="w-5 h-5 text-blue-400" /> Watched Movies</>
                                )}
                                {activeModal === "reviews" && (
                                    <><Star className="w-5 h-5 text-yellow-500" /> Reviews & Comments</>
                                )}
                                {activeModal === "toWatch" && (
                                    <><Calendar className="w-5 h-5 text-purple-400" /> To Watch List</>
                                )}
                                {activeModal === "friends" && (
                                    <><Users className="w-5 h-5 text-green-400" /> Friends</>
                                )}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 focus:outline-none">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-[#0f171e]">
                            {activeModal === "watched" && (
                                watchedMovies.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <Film className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No watched movies yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {watchedMovies.map((m: any) => m && (
                                            <Link key={m.id} href={`/movie/${m.id}`} onClick={() => setActiveModal(null)} className="group relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 block hover:border-blue-500 transition-colors shadow-sm hover:shadow-blue-500/20">
                                                {m.poster_path ? (
                                                    <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film className="w-6 h-6" /></div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )
                            )}
                            {activeModal === "reviews" && (
                                reviewActivity.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <Star className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No reviews or comments yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviewActivity.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-[#1a242f] p-4 rounded-xl border border-gray-800 flex gap-4 hover:border-gray-700 transition-colors">
                                                <Link href={`/movie/${item.movie?.id}`} onClick={() => setActiveModal(null)} className="shrink-0 w-16 h-24 rounded bg-zinc-800 overflow-hidden hidden sm:block border border-zinc-700">
                                                    {item.movie?.poster_path ? (
                                                        <img src={`https://image.tmdb.org/t/p/w500${item.movie.poster_path}`} alt="poster" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film /></div>
                                                    )}
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Review</span>
                                                            <span className="text-xs text-zinc-500">{format(new Date(item.date), 'MMM d, yyyy')}</span>
                                                        </div>
                                                        <p className="text-sm text-zinc-300">
                                                            Rated <Link href={`/movie/${item.movie?.id}`} onClick={() => setActiveModal(null)} className="font-bold text-white hover:underline">{item.movie?.title}</Link>
                                                            <span className="inline-flex items-center gap-1 ml-2 text-yellow-500 font-bold bg-black/30 px-1.5 py-0.5 rounded text-xs border border-yellow-500/20">
                                                                <Star className="w-3 h-3 fill-current" /> {item.review.rating}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {item.review.text && (
                                                        <p className="text-sm text-zinc-300 bg-[#0f171e]/50 p-3 rounded-lg border border-gray-800/50 italic mt-3 shadow-inner">
                                                            "{item.review.text}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                            {activeModal === "toWatch" && (
                                toWatchMovies.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Watchlist is empty.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {toWatchMovies.map((m: any) => m && (
                                            <Link key={m.id} href={`/movie/${m.id}`} onClick={() => setActiveModal(null)} className="group relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 block hover:border-blue-500 transition-colors shadow-sm hover:shadow-blue-500/20">
                                                {m.poster_path ? (
                                                    <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film className="w-6 h-6" /></div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )
                            )}
                            {activeModal === "friends" && (
                                friends.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <Users className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No friends yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {friends.map((friend: any) => (
                                            <Link key={friend._id} href={`/profile/${friend._id}`} onClick={() => setActiveModal(null)} className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl p-4 flex items-center gap-3 transition-all group">
                                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-zinc-700 group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                                                    {friend.profileImage ? (
                                                        <img src={friend.profileImage} alt={friend.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-400 group-hover:text-blue-400">
                                                            {friend.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-white truncate">{friend.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
