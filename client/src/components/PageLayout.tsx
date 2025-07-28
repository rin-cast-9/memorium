"use client"

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Header from "./Header";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith("/auth");

    return (
        <>
            {!isAuthPage && <Header />}
            {children}
            <Footer />
        </>
    )
};

export default PageLayout;