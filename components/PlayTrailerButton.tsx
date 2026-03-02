"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import TrailerModal from "./TrailerModal";

export default function PlayTrailerButton({ movieId }: { movieId: number }) {
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsTrailerOpen(true)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
                <Play className="w-5 h-5 fill-current" />
                Play Trailer
            </button>
            <TrailerModal
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                movieId={movieId}
            />
        </>
    );
}
