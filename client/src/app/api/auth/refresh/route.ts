import { apiUrl } from "@/utils/api";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const cookie = req.headers.get("cookie") ?? "";

    const res = await fetch(`${apiUrl}/refresh`, {
        method: "POST",
        headers: { Cookie: cookie },
    });

    console.log(res.headers.getSetCookie());

    const nextRes = new NextResponse(null, { status: res.status });

    const setCookies = res.headers.getSetCookie();
    if (setCookies) {
        setCookies.forEach((c) => nextRes.headers.append("Set-Cookie", c));
    }

    return nextRes;
};