import { apiUrl } from "@/utils/api"

export const POST = async (req: Request) => {
    const res = await fetch(`${apiUrl}/logout`, {
        method: "POST",
    });

    return Response.json(null, {
        status: res.status,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": res.headers.get("set-cookie")!,
        }
    });
};