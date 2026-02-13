import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export const HomePage = async () => {
    const cookieStore = await cookies();
    const hasSession = cookieStore.get("refresh_token")?.value;

    if (hasSession) {
        redirect("/library");
    }

    redirect("/auth");
};