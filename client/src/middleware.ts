import { NextRequest, NextResponse } from "next/server";

const middleware = (req: NextRequest) => {
    const { pathname } = req.nextUrl;

    const hasSession = req.cookies.get("refresh_token")?.value;

    const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/auth");

    const isProtectedRoute = !isPublicRoute;

    if (!hasSession && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    if (hasSession && isPublicRoute) {
        return NextResponse.redirect(new URL("/library", req.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/((?!_next|icons|locales|public|api|static).*)"],
};

export default middleware;