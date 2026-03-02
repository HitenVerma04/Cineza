"use client";

import { useState, useEffect } from "react";
import { Star, Send, User, Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    _id: string;
    userId: { _id: string; name: string; profileImage?: string };
    text: string;
    createdAt: string;
}

interface Review {
    _id: string;
    userId: { _id: string; name: string; profileImage?: string };
    rating: number;
    text: string;
    createdAt: string;
    likesCount: number;
    hasLiked: boolean;
    comments: Comment[];
}

export default function ReviewSection({ movieId }: { movieId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Sort state: 'recent' or 'popular'
    const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

    // Comment states
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const router = useRouter();

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/${movieId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [movieId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }
        if (!text.trim()) {
            setError("Please write a review.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId, rating, text }),
            });

            if (res.ok) {
                setText("");
                setRating(0);
                fetchReviews();
                router.refresh();
            } else if (res.status === 401) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to submit review.");
            }
        } catch (error) {
            console.error("Review submission error:", error);
            setError("Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (reviewId: string) => {
        try {
            // Optimistic UI Update
            setReviews(prev => prev.map(r => {
                if (r._id === reviewId) {
                    return {
                        ...r,
                        hasLiked: !r.hasLiked,
                        likesCount: r.hasLiked ? r.likesCount - 1 : r.likesCount + 1
                    };
                }
                return r;
            }));

            const res = await fetch(`/api/reviews/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId }),
            });

            if (!res.ok) {
                if (res.status === 401) router.push("/login"); // Auth required
                // Revert if failed
                fetchReviews();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (reviewId: string, e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/reviews/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, text: commentText }),
            });

            if (res.ok) {
                setCommentText("");
                setActiveCommentId(null);
                fetchReviews();
            } else if (res.status === 401) {
                router.push("/login");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === "popular") {
            // Sort by likes first, then recency
            if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Default recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="space-y-8">
            {/* Review Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Write a Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                className={`transition-colors ${(hover || rating) >= star ? "text-yellow-500" : "text-zinc-600"}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                            >
                                <Star className="w-8 h-8 fill-current" />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What did you think of the movie?"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                        rows={4}
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Casting Review..." : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Post Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2 sm:mb-0">
                        Community Reviews ({reviews.length})
                    </h3>

                    {/* Sort Controls */}
                    {reviews.length > 0 && (
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                            <button
                                onClick={() => setSortBy("recent")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === "recent" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                            >
                                Recent
                            </button>
                            <button
                                onClick={() => setSortBy("popular")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === "popular" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                            >
                                Top Opinions
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-8 text-zinc-500 animate-pulse">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                        <p className="text-zinc-400">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    sortedReviews.map((review, index) => (
                        <div key={review._id} className="bg-zinc-900/80 rounded-lg p-5 border border-zinc-800 transition-colors hover:border-zinc-700 relative overflow-hidden">
                            {/* Popular Opinion Badge */}
                            {sortBy === "popular" && index === 0 && review.likesCount > 0 && (
                                <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-500 text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-yellow-500/20 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Top Fan Opinion
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Link href={`/profile/${review.userId._id}`} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden shrink-0 hover:border-white transition-colors">
                                        {review.userId.profileImage ? (
                                            <img src={review.userId.profileImage} alt={review.userId.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-400" />
                                        )}
                                    </Link>
                                    <div>
                                        <Link href={`/profile/${review.userId._id}`} className="font-medium text-white hover:underline">{review.userId.name || "Anonymous User"}</Link>
                                        <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-zinc-950/50 px-2 py-1.5 rounded-md border border-zinc-800 mt-1 sm:mt-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-current" : "text-zinc-700"}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Body */}
                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed mb-4">{review.text}</p>

                            {/* Interaction Bar */}
                            <div className="flex items-center gap-6 pt-3 border-t border-zinc-800/50">
                                <button
                                    onClick={() => handleLike(review._id)}
                                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${review.hasLiked ? "text-pink-500" : "text-zinc-400 hover:text-pink-400"}`}
                                >
                                    <Heart className={`w-4 h-4 ${review.hasLiked ? "fill-current" : ""}`} />
                                    <span>{review.likesCount || 0}</span>
                                </button>
                                <button
                                    onClick={() => setActiveCommentId(activeCommentId === review._id ? null : review._id)}
                                    className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-colors text-sm font-medium"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{review.comments?.length || 0}</span>
                                </button>
                            </div>

                            {/* Discussion Threads (Comments Section) */}
                            {activeCommentId === review._id && (
                                <div className="mt-4 pt-4 border-t border-zinc-800 bg-zinc-950/30 -mx-5 px-5 pb-2">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Discussion Thread</h4>

                                    {/* Existing Comments */}
                                    <div className="space-y-4 mb-4">
                                        {review.comments?.map(comment => (
                                            <div key={comment._id} className="flex gap-3">
                                                <Link href={`/profile/${comment.userId._id}`} className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 mt-1 hover:ring-1 hover:ring-white transition-all">
                                                    {comment.userId.profileImage ? (
                                                        <img src={comment.userId.profileImage} alt={comment.userId.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                                                            {comment.userId.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </Link>
                                                <div className="flex-1 bg-zinc-900 rounded-lg p-3 border border-zinc-800/80">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <Link href={`/profile/${comment.userId._id}`} className="font-medium text-white text-sm hover:underline">{comment.userId.name}</Link>
                                                        <span className="text-[10px] text-zinc-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-300">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Comment Input */}
                                    <form onSubmit={(e) => handleCommentSubmit(review._id, e)} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder="Join the discussion..."
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-600"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingComment || !commentText.trim()}
                                            className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4 ml-0.5" />
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
