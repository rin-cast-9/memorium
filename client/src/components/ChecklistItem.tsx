"use client";

import Checkbox from "./Checkbox";

type ChecklistItemProps = {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
};

const ChecklistItem = ({
    checked,
    label,
    onChange,
}: ChecklistItemProps) => {
    return (
        <div
            className="h-[45px] bg-[var(--color-black-2)] rounded-[12px] border border-[var(--color-stroke)] px-[15px] pt-[13px] pb-[14px] flex items-center gap-[8px] cursor-pointer"
            onClick={() => onChange(!checked)}
        >
            <Checkbox
                checked={checked}
                onChange={onChange}
            >
                {label}
            </Checkbox>
        </div>
    );
};

export default ChecklistItem;