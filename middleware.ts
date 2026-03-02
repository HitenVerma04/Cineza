import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    // Paths that require authentication
    if (pathname.startsWith("/dashboard")) {
        if (!token || !(await verifyToken(token))) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Paths that are only for non-authenticated users
    if (pathname === "/login" || pathname === "/register") {
        if (token && (await verifyToken(token))) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
