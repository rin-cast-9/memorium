"use client";

import { useTranslations } from "use-intl";

type ChecklistComponentProps = {
    displayName: string;
    setDisplayName: React.Dispatch<React.SetStateAction<string>>;
};

const ChecklistCreate = ({
    displayName,
    setDisplayName
}: ChecklistComponentProps) => {
    const t = useTranslations();

    return (
        <div
            className="h-[45px] bg-[var(--color-black-2)] rounded-[12px] border border-[var(--color-stroke)] px-[15px] pt-[13px] pb-[14px] flex items-center gap-[8px]"
        >
            <img src="/icons/icon-plus-grey.svg" alt="add" className="w-[16px] h-[16px]"/>
            <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={t("createNewModuleInFolder")}
                className="flex-1 placeholder:font-small-text placeholder-[var(--color-grey)] outline-none"
            />
        </div>
    );
};

export default ChecklistCreate;