"use client";

import { useTranslations } from "next-intl";
import Student from "./Student";

const Header = () => { 
    const t = useTranslations();
    
    return (
        <header className="h-[65px] mt-[15px] mx-[130px] pb-[15px] bg-[var(--color-black-4)] border-b border-[var(--color-stroke)]/50 flex items-center justify-between">
            <div className="font-content text-[var(--color-white)]">
                {t("memorium")}
            </div>

            <div className="flex items-center gap-x-4">
                <Student/>
            </div>
        </header>
    );
};

export default Header;