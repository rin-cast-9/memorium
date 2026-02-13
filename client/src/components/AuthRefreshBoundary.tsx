"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AuthRefreshBoundary = () => {
    const router = useRouter();

    useEffect(() => {
        const refresh = async () => {
            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include"
            });

            if (res.ok) {
                router.refresh();
            }
        };

        refresh();
    }, [router]);

    return null;
};