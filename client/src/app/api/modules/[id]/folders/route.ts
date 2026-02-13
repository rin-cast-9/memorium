import { fetchWithRefresh } from "@/app/api/backendFetch"

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
    const res = await fetchWithRefresh(`/modules/${params.id}/folders`, req);
    return Response.json(await res.json(), { status: res.status });
};

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
    const body = await req.text();
    const res = await fetchWithRefresh(`/modules/${params.id}/folders`, req, {
        method: "PUT",
        body,
        headers: { "Content-Type": "application/json" },
    });

    return new Response(null, { status: res.status });
};