"use client";

import { AuthTabs } from "@/utils/AuthTabs";
import { useTranslations } from "next-intl";

const YandexAuthButton = ({ activeTab }: { activeTab: AuthTabs }) => {
    const t = useTranslations();

    const text = activeTab === AuthTabs.SIGNUP
        ? t("yandexSignup")
        : t("yandexLogin");

    return (
        <button
            className="w-full h-[55px] bg-[var(--color-black-1)] rounded-[12px] border border-[var(--color-stroke)]/50 flex items-center justify-center hover:cursor-pointer"
        >
            <img src="/icons/icon-yandex.svg" alt="yandex" width={25} height={25} />
            <span className="text-[var(--color-white)] ml-[8px] font-small-text">
                {text}
            </span>
        </button>
    );
};

export default YandexAuthButton;