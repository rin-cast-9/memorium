import { apiUrl } from "@/utils/api";

export const POST = async (req: Request) => {
    const body = await req.text();
    const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    return Response.json(await res.json(), { 
        status: res.status,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": res.headers.get("set-cookie")!,
        },
    });
};