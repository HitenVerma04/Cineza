"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie, MovieDetails, MovieCredits, PersonDetails, PersonMovieCredit, getImageUrl } from "@/lib/tmdb";
import WatchlistButton from "./WatchlistButton";
import { Star, Play, ChevronRight, ChevronLeft, Flame } from "lucide-react";

interface TrendingItem {
    movie: MovieDetails | Movie; // Can be detailed or basic
    credits: MovieCredits | null;
    personDetails?: PersonDetails | null;
    personCredits?: PersonMovieCredit[] | null;
}

interface TrendingHeroProps {
    items: TrendingItem[];
}

export default function TrendingHero({ items }: TrendingHeroProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auto-advance
    useEffect(() => {
        if (!items || items.length === 0) return;

        const interval = setInterval(() => {
            handleNext();
        }, 6000); // 6 seconds per slide

        return () => clearInterval(interval);
    }, [items, activeIndex]);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
            setIsTransitioning(false);
        }, 400); // Wait for fade out
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
            setIsTransitioning(false);
        }, 400);
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[activeIndex];
    const topCast = currentItem.credits?.cast?.[0]; // Get the main celebrity

    // Formatting
    const rating = currentItem.movie.vote_average ? currentItem.movie.vote_average.toFixed(1) : 'NR';
    const releaseYear = currentItem.movie.release_date ? new Date(currentItem.movie.release_date).getFullYear() : 'N/A';

    return (
        <div className="group relative w-full h-[70vh] md:h-[80vh] bg-black overflow-hidden flex flex-col md:flex-row">

            {/* LEFT PANEL: Movie Information */}
            <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-zinc-900 overflow-hidden">
                {/* Background Crossfade Wrapper */}
                <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <img
                        src={getImageUrl(currentItem.movie.backdrop_path || currentItem.movie.poster_path, 'original')}
                        alt={currentItem.movie.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Movie Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-3 text-sm font-semibold text-yellow-500">
                                <span className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                                    <Star className="w-4 h-4 fill-current" /> {rating}
                                </span>
                                <span className="text-zinc-300 bg-white/10 px-2 py-1 rounded">{releaseYear}</span>
                                <span className="text-zinc-300 bg-white/10 px-2 py-1 rounded uppercase tracking-wider text-xs">Trending No. {activeIndex + 1}</span>
                                {('genres' in currentItem.movie) && currentItem.movie.genres && currentItem.movie.genres[0] && (
                                    <span className="text-zinc-300 border border-zinc-600 px-2 py-1 rounded hidden sm:inline-block text-xs">
                                        {currentItem.movie.genres.slice(0, 2).map(g => g.name).join(' • ')}
                                    </span>
                                )}
                                {'popularity' in currentItem.movie && (
                                    <span className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded flex items-center gap-1">
                                        <Flame className="w-3 h-3 fill-current" /> {Math.round((currentItem.movie as any).popularity)} Heat Record
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                                {currentItem.movie.title}
                            </h1>

                            <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-8 drop-shadow-md hidden sm:block delay-100">
                                {currentItem.movie.overview}
                            </p>

                            <div className="flex items-center gap-4">
                                <Link href={`/movie/${currentItem.movie.id}`} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 md:px-8 md:py-4 rounded-full flex items-center gap-2 transition-transform hover:scale-105">
                                    <Play className="w-5 h-5 fill-current" />
                                    Watch Trailer
                                </Link>
                                <div className="hidden sm:block">
                                    <WatchlistButton movieId={currentItem.movie.id.toString()} variant="icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left/Right Nav Overlays */}
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 duration-300">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            {/* RIGHT PANEL: Celebrity Focus */}
            <div className="relative w-full md:w-1/3 h-1/2 md:h-full bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col justify-center px-8 sm:px-12 py-8 overflow-hidden">
                {/* Subtle blurred background of the celebrity */}
                <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-40'}`}>
                    {topCast?.profile_path && (
                        <img
                            src={getImageUrl(topCast.profile_path)}
                            alt="Background Blur"
                            className="w-full h-full object-cover blur-3xl scale-125 saturate-50 opacity-20"
                        />
                    )}
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="mb-4 text-xs font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-yellow-500"></span>
                        Trending Cast
                    </div>

                    <div className={`transition-all duration-700 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
                        {topCast ? (
                            <div className="flex flex-col gap-6">
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-2xl relative">
                                    {topCast.profile_path ? (
                                        <img
                                            src={getImageUrl(topCast.profile_path)}
                                            alt={topCast.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            No Photo
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                        {topCast.name}
                                    </h2>
                                    <p className="text-yellow-500/80 font-medium italic mb-3">
                                        as {topCast.character}
                                    </p>

                                    {/* Known For Section */}
                                    {currentItem.personCredits && currentItem.personCredits.length > 0 && (
                                        <div className="mt-4 border-t border-zinc-800 pt-4">
                                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">Best Known For</p>
                                            <div className="flex gap-3">
                                                {currentItem.personCredits.map(credit => (
                                                    <div
                                                        key={credit.id}
                                                        className="relative w-12 h-16 md:w-16 md:h-24 rounded border border-zinc-700 overflow-hidden group/poster transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(234,179,8,0.3)] will-change-transform z-10"
                                                        style={{ perspective: '1000px' }}
                                                        title={credit.title}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 pointer-events-none transition-opacity duration-500 opacity-0 group-hover/poster:opacity-100 z-20" />
                                                        {credit.poster_path ? (
                                                            <img src={getImageUrl(credit.poster_path, 'w500')} alt={credit.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110" />
                                                        ) : (
                                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center transition-transform duration-500 group-hover/poster:scale-110">
                                                                <Star className="w-4 h-4 text-zinc-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-zinc-400 mt-2 border-l-2 border-yellow-500/50 pl-4 bg-zinc-900/40 p-3 rounded-r-md">
                                    {currentItem.personDetails ? (
                                        <>Trending worldwide alongside <strong className="text-white">"{currentItem.movie.title}"</strong>, hitting a peak popularity score of <strong className="text-orange-400">{Math.round(currentItem.personDetails.popularity)}</strong>.</>
                                    ) : (
                                        <>Currently trending globally alongside <strong className="text-zinc-200">{currentItem.movie.title}</strong>.</>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="text-zinc-500 italic py-10">
                                Cast information unavailable.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Nav Button */}
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-black/80 rounded-full items-center justify-center text-white backdrop-blur transition-all hidden md:flex opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 duration-300">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Position Indicators */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 md:left-1/3 -translate-x-1/2 z-30 flex gap-2">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                                setActiveIndex(idx);
                                setIsTransitioning(false);
                            }, 400);
                        }}
                        className={`transition-all duration-300 rounded-full ${activeIndex === idx ? 'w-8 bg-yellow-500' : 'w-2 bg-white/30 hover:bg-white/50'} h-2`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

        </div>
    );
}
