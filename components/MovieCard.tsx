"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { Star, Share2 } from 'lucide-react';

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    // Format the release date to just the year
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

    // Format rating to 1 decimal place
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/movie/${movie.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: movie.title,
                    text: `Check out ${movie.title} on CineCircle!`,
                    url: url
                });
            } catch (err) {
                console.log("Error sharing", err);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <Link href={`/movie/${movie.id}`} className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-950 transition-all duration-500 hover:border-zinc-400 hover:z-50 hover:-translate-y-4 hover:scale-[1.05] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] cursor-pointer flex-1 h-full w-full border border-zinc-800 shadow-md transform-gpu block">
            {/* Poster Image (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full bg-zinc-900 border-b border-zinc-800/50 group-hover:border-transparent transition-colors duration-500">
                {movie.backdrop_path ? (
                    <Image
                        src={getImageUrl(movie.backdrop_path, 'original')}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : movie.poster_path ? (
                    <Image
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500 text-xs transition-transform duration-700 ease-out group-hover:scale-110">
                        No Image
                    </div>
                )}

                {/* Subtle default gradient at bottom for depth */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none transition-opacity duration-500" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />

                {/* Premium Hover Overlay */}
                <div className="absolute inset-x-0 inset-y-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 leading-tight drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75 ease-out">
                        {movie.title}
                    </h3>

                    <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-100 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100 ease-out backdrop-blur-md shadow-inner">
                        <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current drop-shadow-sm" />
                            {rating}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                        <span>{releaseYear}</span>
                    </div>
                </div>
                <button
                    onClick={handleShare}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300 z-10"
                    title="Share Movie"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </Link>
    );
}
