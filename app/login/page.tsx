"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Film } from "lucide-react";
import Link from "next/link";

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Invalid email or password");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center relative overflow-hidden text-slate-200 font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -top-32 -left-32"></div>
                <div className="absolute w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px] bottom-0 right-0"></div>
            </div>

            <div className="z-10 w-full max-w-md px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Film className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 font-medium tracking-wide">
                        Sign in to continue to CineCircle.
                    </p>
                </div>

                <div className="bg-[#111111]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle top border glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1"
                            >
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 block pl-11 p-3.5 transition-all shadow-inner placeholder:text-gray-600"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                                >
                                    Password
                                </label>
                                <a href="#" className="text-xs text-red-500 hover:text-red-400 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 block pl-11 p-3.5 transition-all shadow-inner placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white bg-red-600 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-500/50 font-bold rounded-xl text-sm px-5 py-4 text-center mt-6 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn className="mr-2 w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-sm font-medium text-gray-400 text-center mt-8">
                        New to CineCircle?{" "}
                        <Link
                            href="/register"
                            className="text-red-500 hover:text-red-400 transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
