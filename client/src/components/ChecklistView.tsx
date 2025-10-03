"use client";

import { useState } from "react";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import ChecklistCreate from "./ChecklistCreate";
import ChecklistItem from "./ChecklistItem";

type ChecklistViewProps<T extends { id: number, display_name: string }> = {
    items: T[];
    selected: Set<number>;
    setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    onSubmit: (selected: Set<number>, newDisplayName: string) => void;
    placeholder: string;
};

const ChecklistView = <T extends {id: number; display_name: string; }>({
    items,
    selected,
    setSelected,
    onSubmit,
    placeholder,
}: ChecklistViewProps<T>) => {
    const t = useTranslations();

    const [newDisplayName, setNewDisplayName] = useState("");

    const toggleSelect = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-[12px]">
            <ChecklistCreate
                displayName={newDisplayName}
                setDisplayName={setNewDisplayName}
                placeholder={placeholder}
            />
            {items.map(item => (
                <ChecklistItem
                    key={item.id}
                    checked={selected.has(item.id)}
                    label={item.display_name}
                    onChange={() => toggleSelect(item.id)}
                />
            ))}

            <Button
                label={t("save")}
                size={ButtonSize.MEDIUM}
                type={ButtonType.PRIMARY}
                htmlType="button"
                onClick={() => onSubmit(selected, newDisplayName)}
                className="mt-[18px]"
            />
        </div>
    );
};

export default ChecklistView;