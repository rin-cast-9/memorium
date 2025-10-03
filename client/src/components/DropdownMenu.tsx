"use client";

import { useEffect, useRef, useState } from "react";

type DropdownItem = {
    label: string;
    onClick: () => void;
    icon?: string;
};

type DropdownMenuProps = {
    items: DropdownItem[];
    trigger: React.ReactNode;
};

const DropdownMenu = ({
    items,
    trigger
}: DropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative inline-block">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
            >
                {trigger}
            </div>

            {open && (
                <div
                    className="absolute flex flex-col justify-center gap-[10px] py-[12px] right-0 mt-[15px] min-w-[184px] w-max rounded-[12px] bg-[var(--color-black-1)] border border-[var(--color-stroke)] z-40"
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item, idx) => (
                        <div key={idx}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick();
                                    setOpen(false);
                                }}
                                className="w-full flex items-center px-[15px] text-left text-[var(--color-white)] hover:cursor-pointer"
                            >
                                {item.icon && (
                                    <img src={item.icon} alt="" className="w-[16px] h-[16px] mr-[10px]"/>
                                )}
                                <span>{item.label}</span>
                            </button>

                            {idx < items.length - 1 && (
                                <div className="h-px bg-[var(--color-stroke)] mx-[15px] mt-[10px]"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;