"use client";

import { AuthTabs } from "@/utils/AuthTabs";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type AuthTabsComponentProps = {
    activeTab: AuthTabs;
    setActiveTab: (tab: AuthTabs) => void;
};

const AuthTabsComponent = ({
    activeTab,
    setActiveTab,
}: AuthTabsComponentProps) => {
    const t = useTranslations();

    const signupRef = useRef<HTMLButtonElement>(null);
    const loginRef = useRef<HTMLButtonElement>(null);
    const [lineLeft, setLineLeft] = useState("0px");
    const [lineWidth, setLineWidth] = useState("0px");

    useEffect(() => {
        const activeElement = activeTab === AuthTabs.SIGNUP ? signupRef.current : loginRef.current;

        if (activeElement) {
            const { offsetLeft, offsetWidth } = activeElement;
            setLineLeft(`${offsetLeft}px`);
            setLineWidth(`${offsetWidth}px`);
        }
    }, [activeTab]);

    return (
        <div className="mt-[40px]">
            <div className="flex relative border-b border-[var(--color-stroke)]/50">
                <button
                    ref={signupRef}
                    className={`relative pb-[10px] mr-[30px] font-small-text hover:cursor-pointer ${activeTab === AuthTabs.SIGNUP ? "text-[var(--color-violet)]" : "text-[var(--color-grey)]"}`}
                    onClick={() => setActiveTab(AuthTabs.SIGNUP)}
                >
                    {t("signup")}
                </button>
                <button
                    ref={loginRef}
                    className={`relative pb-[10px] font-small-text hover:cursor-pointer ${activeTab === AuthTabs.LOGIN ? "text-[var(--color-violet)]" : "text-[var(--color-grey)]"}`}
                    onClick={() => setActiveTab(AuthTabs.LOGIN)}
                >
                    {t("login")}
                </button>

                <span
                    className="absolute bottom-[-1px] h-[1px] bg-[var(--color-violet)] transition-all duration-200"
                    style={{ left: lineLeft, width: lineWidth }}
                />
            </div>
        </div>
    );
};

export default AuthTabsComponent;