"use client";

import { useRef, useState, useEffect } from 'react';
import { Movie } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieGridProps {
    title?: string;
    movies: Movie[];
}

export default function MovieGrid({ title, movies }: MovieGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [movies]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="py-6 relative group/slider">
            {title && (
                <h2 className="text-xl font-bold tracking-tight text-white mb-4 px-4 sm:px-6 lg:px-8">
                    {title}
                </h2>
            )}

            <div className="relative">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0 focus:outline-none focus:ring-2 focus:ring-zinc-400 shadow-xl border border-white/10"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-4 py-8 -my-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scrollbar-hide hide-scroll"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0 focus:outline-none focus:ring-2 focus:ring-zinc-400 shadow-xl border border-white/10"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}
