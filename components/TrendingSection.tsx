"use client";

import { useState, useEffect, useRef } from "react";
import { getTrendingMovies, Movie } from "@/lib/tmdb";
import MovieGrid from "./MovieGrid";
import { Loader2 } from "lucide-react";

export default function TrendingSection({ initialMovies }: { initialMovies: Movie[] }) {
    const [timeWindow, setTimeWindow] = useState<"day" | "week">("day");
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [loading, setLoading] = useState(false);

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        async function fetchMovies() {
            setLoading(true);
            try {
                const data = await getTrendingMovies(timeWindow);
                setMovies(data.slice(1, 15));
            } catch (err) {
                console.error("Failed to fetch trending:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [timeWindow]);

    return (
        <section className="pt-2">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
                <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-bold text-white">Trending</h2>

                    {/* Toggle Switch */}
                    <div className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/50 p-0.5 relative overflow-hidden">
                        <button
                            onClick={() => setTimeWindow("day")}
                            className={`relative w-24 py-1 text-sm font-semibold transition-colors z-10 ${timeWindow === 'day' ? 'text-[#061e36]' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setTimeWindow("week")}
                            className={`relative w-24 py-1 text-sm font-semibold transition-colors z-10 ${timeWindow === 'week' ? 'text-[#061e36]' : 'text-zinc-400 hover:text-white'}`}
                        >
                            This Week
                        </button>

                        {/* Animated sliding background pill */}
                        <div
                            className="absolute top-0.5 bottom-0.5 w-24 bg-gradient-to-r from-[#1cd3a2] to-[#01b4e4] rounded-full transition-transform duration-300 ease-out z-0"
                            style={{ transform: timeWindow === 'day' ? 'translateX(0)' : 'translateX(100%)' }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f171e]/70 backdrop-blur-sm transition-opacity duration-300">
                        <Loader2 className="w-10 h-10 text-[#1cd3a2] animate-spin" />
                    </div>
                )}
                <MovieGrid title="" movies={movies} />
            </div>
        </section>
    );
}
