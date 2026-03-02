import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CineCircle - Discover & Review Movies",
    description: "A personalized movie discovery and social review platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <Navbar />
                <main className="flex-grow">{children}</main>
                <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800">
                    &copy; {new Date().getFullYear()} CineCircle. All rights reserved.
                </footer>
            </body>
        </html>
    );
}
