"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Play } from "lucide-react";
import { getMovieVideos } from "@/lib/tmdb";

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    movieId: number | null;
}

export default function TrailerModal({ isOpen, onClose, movieId }: TrailerModalProps) {
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!isOpen || !movieId) {
            setTrailerKey(null);
            setError(false);
            return;
        }

        async function fetchTrailer() {
            setLoading(true);
            setError(false);
            try {
                // We can fetch directly here since the API wrapper is client-safe
                const videos = await getMovieVideos(movieId!.toString());

                if (videos && videos.length > 0) {
                    const trailer = videos.find(
                        (vid) => vid.site === "YouTube" && vid.type === "Trailer"
                    ) || videos.find(
                        (vid) => vid.site === "YouTube"
                    );

                    if (trailer) {
                        setTrailerKey(trailer.key);
                    } else {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch trailer:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchTrailer();
    }, [isOpen, movieId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div
                className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px]"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-neutral-800 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Close Trailer"
                >
                    <X className="w-5 h-5" />
                </button>

                {loading && (
                    <div className="flex flex-col items-center text-yellow-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-white font-medium">Loading trailer...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center text-zinc-400 p-8 text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Play className="w-8 h-8 text-zinc-600 ml-1" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">No trailer found</p>
                        <p>We couldn't find a trailer for this movie.</p>
                    </div>
                )}

                {trailerKey && !loading && (
                    <div className="w-full h-full aspect-video bg-black">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                            title="Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
            </div>

            {/* Click outside to close wrapper */}
            <div className="absolute inset-0 z-[-1]" onClick={onClose} />
        </div>
    );
}
