import { fetchWithRefresh } from "@/app/api/backendFetch"

export const GET = async (req: Request) => {
    const res = await fetchWithRefresh("/modules", req);
    return Response.json(await res.json(), { status: res.status });
};

export const POST = async (req: Request) => {
    const body = await req.text();
    const res = await fetchWithRefresh("/modules", req, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
    });

    return Response.json(await res.json(), { status: res.status });
};