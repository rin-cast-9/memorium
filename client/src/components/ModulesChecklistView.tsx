"use client";

import { Module } from "@/utils/Module";
import ChecklistComponent from "./ChecklistComponent";
import { ChecklistComponentMode } from "@/utils/ChecklistComponentMode";
import { useState } from "react";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { ButtonSize, ButtonType } from "@/utils/Button.types";

type ModulesChecklistViewProps = {
    modules: Module[];
    selectionMap: Map<number, boolean>;
    setSelectionMap: React.Dispatch<React.SetStateAction<Map<number, boolean>>>;
    onCreate: (displayName: string) => Promise<Module | null>;
    onSubmit: (modulesByFolderMap: Map<number, boolean>) => void;
};

const ModulesChecklistView = ({
    modules,
    selectionMap,
    setSelectionMap,
    onCreate,
    onSubmit,
}: ModulesChecklistViewProps) => {
    const t = useTranslations();

    const [newModuleDisplayName, setNewModuleDisplayName] = useState("");

    const handleSubmit = async () => {
        let updatedMap = new Map(selectionMap);

        if (newModuleDisplayName) {
            const createdModule = await onCreate(newModuleDisplayName);
            
            if (createdModule) {
                updatedMap.set(createdModule.id, true);
            }
        }

        setSelectionMap(updatedMap);
        onSubmit(updatedMap);
    };

    const handleSelect = (moduleId: number) => {
        setSelectionMap(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(moduleId) ?? false;
            newMap.set(moduleId, !current);
            return newMap;
        });
    };

    return (
        <div className="flex flex-col gap-[12px]">
            <ChecklistComponent
                mode={ChecklistComponentMode.CREATE}
                displayName={newModuleDisplayName}
                setDisplayName={setNewModuleDisplayName}
            />
            {modules.map(module => {
                const isSelected = selectionMap.get(module.id) ?? false;
                return (
                    <ChecklistComponent
                        key={module.id}
                        mode={ChecklistComponentMode.DISPLAY}
                        id={module.id}
                        displayName={module.display_name}
                        isSelected={isSelected}
                        onClick={() => handleSelect(module.id)}
                    />
                )
            })}

            <Button
                label={t("save")}
                size={ButtonSize.MEDIUM}
                type={ButtonType.PRIMARY}
                htmlType="button"
                onClick={handleSubmit}
                className="mt-[18px]"
            />
        </div>
    );
};

export default ModulesChecklistView;