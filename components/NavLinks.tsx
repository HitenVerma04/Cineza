"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/dashboard" },
        { name: "Movies", href: "/top-rated" },
        { name: "Social", href: "/social" },
        { name: "Friends", href: "/friends" },
        { name: "Chat", href: "/chat" },
        { name: "Watchlist", href: "/watchlist" },
    ];

    return (
        <div className="hidden md:flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50">
            {links.map((link) => {
                const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`
                            px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200
                            ${isActive
                                ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}
                        `}
                    >
                        {link.name}
                    </Link>
                );
            })}
        </div>
    );
}
