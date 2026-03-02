import Link from "next/link";
import { cookies } from "next/headers";
import { Film, UserCircle } from "lucide-react";
import LogoutButton from "./LogoutButton";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";

export default function Navbar() {
    const token = cookies().get("token")?.value;
    const isAuthenticated = !!token;

    return (
        <nav className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                        <Link href="/" className="flex items-center space-x-2 text-white mr-4">
                            <span className="text-xl font-bold tracking-tighter">CineCircle</span>
                        </Link>

                        {isAuthenticated && (
                            <NavLinks />
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <SearchBar />
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="text-gray-300 hover:text-white transition-colors flex items-center"
                                    title="Your Profile"
                                >
                                    <UserCircle size={26} strokeWidth={1.5} className="text-blue-400" />
                                </Link>
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
