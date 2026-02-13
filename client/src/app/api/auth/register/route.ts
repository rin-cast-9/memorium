import { apiUrl } from "@/utils/api";

export const POST = async (req: Request) => {
    const body = await req.text();
    const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    return Response.json(null, { status: res.status });
};