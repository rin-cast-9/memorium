"use client";

import { TabState } from "@/utils/TabState";

type TabProps = {
    icon: string,
    text: string,
    state: TabState,
};

const Tab = ({
    icon,
    text,
    state,
}: TabProps) => {
    const isActive = state === TabState.ACTIVE;

    return (
        <div
            className={`flex items-center justify-center h-[45px] min-w-[120px] px-[14px] rounded-[12px] bg-[var(--color-black-1)] border ${isActive ? "border-[var(--color-violet)] text-[var(--color-white)]" : "border-[var(--color-stroke)] text-[var(--color-grey)]"}`}
        >
            <img
                src={icon}
                alt=""
                className={`w-[16px] h-[16px] mr-[6px] ${isActive ? "opacity-100" : "opacity-40"}`}
            />
            <span className="font-bold-content whitespace-nowrap">{text}</span>
        </div>
    )
};

export default Tab;