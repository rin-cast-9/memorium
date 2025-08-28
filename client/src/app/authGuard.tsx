"use client"

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("token");
};

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const auth = isAuthenticated();

        if (!auth && pathname !== "/auth") {
            router.push("/auth");
        }

        if (auth && pathname === "/auth") {
            router.push("/library");
        }
    }, [pathname, router]);

    return (
        <>
            {children}
        </>
    );
};

export default AuthGuard;