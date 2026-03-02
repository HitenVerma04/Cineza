"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, Share2, Film, TrendingUp, Star, Send } from "lucide-react";
import { getMovieDetails, MovieDetails, getImageUrl } from "@/lib/tmdb";

interface CommentData {
    _id: string;
    userId: { _id: string; name: string; profileImage?: string };
    text: string;
    createdAt: string;
}

interface FeedUser {
    id: string;
    name: string;
    profileImage?: string;
}

interface FeedItemData {
    _id: string;
    reviewId?: string;
    type: "friend_review" | "friend_watch" | "global_debate" | "global_viral" | "system_trend";
    timestamp: string;
    user?: FeedUser;
    movieId: string;
    rating?: number;
    text?: string;
    likesCount?: number;
    isLikedByMe?: boolean;
    commentsCount?: number;
}

export default function FeedItem({ item }: { item: FeedItemData }) {
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [liked, setLiked] = useState(item.isLikedByMe || false);
    const [likesCount, setLikesCount] = useState(item.likesCount || 0);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsCountVal, setCommentsCountVal] = useState(item.commentsCount || 0);

    const handleLike = async () => {
        if (!item.reviewId) return;

        // Optimistic UI update
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);

        try {
            await fetch(`/api/reviews/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId: item.reviewId })
            });
        } catch (error) {
            // Revert on error
            setLiked(liked);
            setLikesCount(item.likesCount || 0);
        }
    };

    const toggleComments = async () => {
        if (!item.reviewId) return;

        const nextState = !showComments;
        setShowComments(nextState);

        if (nextState) {
            setLoadingComments(true);
            try {
                const res = await fetch(`/api/reviews/comment/${item.reviewId}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !item.reviewId) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/reviews/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId: item.reviewId, text: commentText }),
            });

            if (res.ok) {
                setCommentText("");
                setCommentsCountVal(prev => prev + 1);

                // Refetch immediately to show the new comment
                const fetchRes = await fetch(`/api/reviews/comment/${item.reviewId}`);
                if (fetchRes.ok) {
                    const data = await fetchRes.json();
                    setComments(data);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    useEffect(() => {
        getMovieDetails(item.movieId).then(data => {
            if (data) setMovie(data);
        });
    }, [item.movieId]);

    if (!movie) {
        return <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48 w-full mb-4"></div>;
    }

    const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

    // Render logic based on type
    return (
        <div className="flex flex-col lg:flex-row gap-4 mb-6 relative w-full items-start">
            {/* Main Post Container */}
            <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all duration-500 hover:bg-zinc-800/50 flex-1 w-full shadow-lg ${showComments ? 'lg:max-w-[65%]' : ''}`}>
                {/* Header: User & Context */}
                <div className="flex items-center gap-3 mb-3">
                    {item.type === "system_trend" ? (
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shadow-inner">
                            <TrendingUp className="w-5 h-5 text-yellow-500" />
                        </div>
                    ) : (
                        <Link href={`/profile/${item.user?.id}`} className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0 hover:ring-2 hover:ring-blue-500 transition-all shadow-sm">
                            {item.user?.profileImage ? (
                                <img src={item.user.profileImage} alt={item.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold bg-zinc-800">
                                    {item.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                    )}

                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300">
                            {item.type === "system_trend" && (
                                <span className="text-yellow-500 font-bold">Movie gaining sudden popularity</span>
                            )}
                            {item.type === "friend_watch" && (
                                <><Link href={`/profile/${item.user?.id}`} className="text-white hover:underline cursor-pointer font-bold">{item.user?.name}</Link> just watched</>
                            )}
                            {item.type === "friend_review" && (
                                <><Link href={`/profile/${item.user?.id}`} className="text-white hover:underline cursor-pointer font-bold">{item.user?.name}</Link> reviewed</>
                            )}
                            {item.type === "global_debate" && (
                                <><span className="text-blue-400 font-bold flex items-center gap-1 inline-flex"><MessageCircle className="w-3 h-3" /> Debate started</span> by <Link href={`/profile/${item.user?.id}`} className="text-white hover:underline cursor-pointer font-bold">{item.user?.name}</Link> about</>
                            )}
                            {item.type === "global_viral" && (
                                <><span className="text-pink-500 font-bold flex items-center gap-1 inline-flex"><Heart className="w-3 h-3 fill-current" /> Viral Review</span> by <Link href={`/profile/${item.user?.id}`} className="text-white hover:underline cursor-pointer font-bold">{item.user?.name}</Link> for</>
                            )}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{timeAgo}</p>
                    </div>
                </div>

                {/* Content: Movie & Review Details */}
                <div className="flex gap-4 mt-4">
                    <Link href={`/movie/${movie.id}`} className="shrink-0 group">
                        <div className="w-16 h-24 sm:w-20 sm:h-32 rounded-lg border border-white/10 overflow-hidden relative shadow-md">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                            <img
                                src={getImageUrl(movie.poster_path, 'w500')}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <Link href={`/movie/${movie.id}`}>
                            <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2 truncate">
                                {movie.title}
                                <span className="text-sm font-normal text-zinc-500 shrink-0">
                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                </span>
                            </h3>
                        </Link>

                        {/* Rendering rating if applicable */}
                        {item.rating && (
                            <div className="flex items-center gap-1 my-1.5 text-yellow-500 drop-shadow-sm">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < item.rating! ? "fill-current" : "text-zinc-700"}`} />
                                ))}
                            </div>
                        )}

                        {/* Rendering text if applicable */}
                        {item.text && (
                            <p className="text-sm text-zinc-300 mt-2 line-clamp-4 leading-relaxed">
                                "{item.text}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Interaction Bar */}
                {(item.type === "friend_review" || item.type === "global_debate" || item.type === "global_viral") && (
                    <div className="flex items-center gap-6 mt-5 pt-3 border-t border-white/5 text-zinc-500">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 transition-all text-xs font-semibold group ${liked ? "text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" : "hover:text-pink-400"}`}
                        >
                            <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : "group-hover:scale-110"}`} />
                            <span>{likesCount}</span>
                        </button>
                        <button
                            onClick={toggleComments}
                            className={`flex items-center gap-1.5 transition-all text-xs font-semibold group ${showComments ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "hover:text-blue-400 text-zinc-400"}`}
                        >
                            <MessageCircle className={`w-4 h-4 transition-transform ${showComments ? "scale-110" : "group-hover:scale-110"}`} />
                            <span>{commentsCountVal}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors text-xs ml-auto group">
                            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                )}
            </div>

            {/* Inline Discussion Threads (Right Side Panel with 3D Hover) */}
            {showComments && (
                <div
                    className="w-full lg:w-[35%] shrink-0 bg-[#0f1724]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] group/comments relative will-change-transform z-10"
                    style={{ perspective: '1000px' }}
                >
                    {/* Glowing Accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover/comments:opacity-100"></div>

                    <div className="relative z-10 flex flex-col max-h-[400px]">
                        <h4 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-3 flex items-center gap-2 border-b border-white/5 pb-3 shrink-0">
                            <MessageCircle className="w-4 h-4 text-blue-500" /> Discussion
                        </h4>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent h-[250px]">
                            {loadingComments ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center text-xs text-zinc-500 animate-pulse flex flex-col items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-t-blue-500 border-zinc-700 rounded-full animate-spin"></div>
                                        Fetching discussion...
                                    </div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center opacity-70">
                                    <MessageCircle className="w-8 h-8 mb-2 text-zinc-600" />
                                    <p className="text-xs">No comments yet.</p>
                                    <p className="text-[10px] mt-1">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                comments.map((comment, index) => (
                                    <div key={comment._id} className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                                        <Link href={`/profile/${comment.userId._id}`} className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mt-1 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all">
                                            {comment.userId.profileImage ? (
                                                <img src={comment.userId.profileImage} alt={comment.userId.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-300">{comment.userId.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </Link>
                                        <div className="flex-1 bg-zinc-900/80 rounded-xl p-3 border border-white/5 shadow-inner">
                                            <div className="flex justify-between items-baseline mb-1.5">
                                                <Link href={`/profile/${comment.userId._id}`} className="font-bold text-white text-xs hover:text-blue-400 transition-colors">{comment.userId.name}</Link>
                                                <span className="text-[10px] text-zinc-500 font-medium">{formatDistanceToNow(new Date(comment.createdAt))}</span>
                                            </div>
                                            <p className="text-xs text-zinc-300 leading-relaxed">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-2 shrink-0 pt-1">
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Reply to this thread..."
                                className="flex-1 bg-zinc-950/80 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 shadow-inner placeholder:text-zinc-600 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !commentText.trim()}
                                className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] disabled:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transform active:scale-95"
                            >
                                <Send className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
