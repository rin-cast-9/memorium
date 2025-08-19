"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { useTranslations } from "next-intl";

const Student = () => {
    const t = useTranslations();

    const [showLogout, setShowLogout] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setShowLogout(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClick = () => {
        setShowLogout(prev => !prev);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/auth";
    };

    return (
        <div ref={containerRef} className="relative">
            <div onClick={handleClick} className="flex items-center h-[42px] cursor-pointer select-none">
                <div className="flex flex-col items-end justify-center">
                    <span className="font-small-text text-[var(--color-white)]/50">
                        {t("student")}
                    </span>
                    <span className="font-content text-[var(--color-white)]">
                        {localStorage.getItem("username") ?? t("username")}
                    </span>
                </div>

                <div className="w-[50px] h-[50px] rounded-full bg-gray-500 ml-[12px]"></div>
            </div>

            <div className={`absolute top-[calc(100%+15px)] right-0 transition-all duration-100 ${showLogout ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                <Button
                    label="Log out"
                    size={ButtonSize.MEDIUM}
                    type={ButtonType.NEUTRAL}
                    onClick={logout}
                    icon={<img src="/icons/icon-log-out.svg" alt="log-out" width={16} height={16} />}
                />
            </div>
        </div>
    );
};

export default Student;