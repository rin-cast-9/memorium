import { apiUrl, baseUrl } from "@/utils/api";
import { NextResponse } from "next/server";

export const fetchWithRefresh = async (path: string, req: Request, init: RequestInit = {}) => {
    const cookie = req.headers.get("cookie") ?? "";

    console.log(req);

    let res = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers: { ...(init.headers || {}), Cookie: cookie },
    });

    if (res.status !== 401) {
        return res;
    }

    if (isSSRRequest(req)) {
        return res;
    }

    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { Cookie: cookie },
    });

    if (!refreshRes.ok) {
        return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const refreshedCookie = refreshRes.headers.get("set-cookie") ?? cookie;

    return fetch(`${apiUrl}${path}`, {
        ...init,
        headers: { ...(init.headers || {}), Cookie: refreshedCookie },
    });
};

const isSSRRequest = (req: Request) => {
    const ua = req.headers.get("user-agent") || "";
    return ua.includes("node") && !req.headers.has("origin");
};