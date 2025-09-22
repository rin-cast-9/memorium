"use client";

import { Module } from "@/utils/Module";
import { useState } from "react";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import ChecklistCreate from "./ChecklistCreate";
import ChecklistItem from "./ChecklistItem";

type ModulesChecklistViewProps = {
    modules: Module[];
    selected: Set<number>;
    setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    onSubmit: (selected: Set<number>, newModuleDisplayName: string) => void;
};

const ModulesChecklistView = ({
    modules,
    selected,
    setSelected,
    onSubmit,
}: ModulesChecklistViewProps) => {
    const t = useTranslations();

    const [newModuleDisplayName, setNewModuleDisplayName] = useState("");

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
                displayName={newModuleDisplayName}
                setDisplayName={setNewModuleDisplayName}
            />
            {modules.map(module => (
                <ChecklistItem
                    key={module.id}
                    checked={selected.has(module.id)}
                    label={module.display_name}
                    onChange={() => toggleSelect(module.id)}
                />
            ))}

            <Button
                label={t("save")}
                size={ButtonSize.MEDIUM}
                type={ButtonType.PRIMARY}
                htmlType="button"
                onClick={() => onSubmit(selected, newModuleDisplayName)}
                className="mt-[18px]"
            />
        </div>
    );
};

export default ModulesChecklistView;