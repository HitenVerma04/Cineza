import Link from "next/link";
import { Film, TrendingUp, Users, ShieldCheck } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-background to-background">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
                        Your Movie Circle, <br />
                        <span className="text-red-600">Personalized.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-400">
                        Discover your next favorite movie, track your watchlist, and share honest reviews with your friends.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link
                            href="/register"
                            className="rounded-full bg-red-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-red-500 transition-all hover:scale-105"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-full border border-gray-700 bg-transparent px-8 py-3 text-lg font-bold text-white hover:bg-gray-800 transition-all"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-20 bg-[#0c0c0c]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<TrendingUp className="text-red-500" />}
                            title="Discovery"
                            description="Get personalized movie recommendations based on your taste."
                        />
                        <FeatureCard
                            icon={<Film className="text-red-500" />}
                            title="Watchlist"
                            description="Keep track of everything you want to watch in one place."
                        />
                        <FeatureCard
                            icon={<Users className="text-red-500" />}
                            title="Social"
                            description="See what your friends are watching and read their reviews."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-red-500" />}
                            title="Secure"
                            description="Your data is safe with our robust authentication system."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-gray-800">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
