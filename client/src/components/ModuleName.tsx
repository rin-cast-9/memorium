"use client";

import { useTranslations } from "next-intl";

type ModuleNameProps = {
    displayName: string;
    setDisplayName: React.Dispatch<React.SetStateAction<string>>;
};

const ModuleName = ({
    displayName,
    setDisplayName,
}: ModuleNameProps) => {
    const t = useTranslations();

    return (
        <div
            className="h-[80px] bg-[var(--color-black-1)] border border-[var(--color-stroke)] rounded-[15px] pt-[12px] px-[15px] pb-[15px] flex flex-col justify-between"
        >
            <div className="flex">
                <img src="/icons/icon-name.svg" alt="name" className="h-[16px] w-[16px] mr-[6px]"/>
                <p className="font-small-text text-[var(--color-white)]">{t("moduleDisplayName")}</p>
            </div>
            <input
                type="text"
                placeholder={t("enterModuleName")}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="font-small-text placeholder-[var(--color-grey)]/50 outline-none"
            />
        </div>
    );
};

export default ModuleName;