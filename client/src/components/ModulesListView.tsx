"use client";

import { Module } from "@/utils/Module";
import ModuleView from "./ModuleView";
import { useTranslations } from "next-intl";
import EmptyLibrary from "./EmptyLibrary";

type ModulesListViewProps = {
    items: Module[];
    onCreate: () => void;
    onEdit: (id: number) => void;
    onSaveToFolderModal: (id: number) => void;
    onDelete: (id: number) => void;
    showOptions?: boolean;
};

const ModulesListView = ({
    items,
    onCreate,
    onEdit,
    onSaveToFolderModal,
    onDelete,
    showOptions = true
}: ModulesListViewProps) => {
    const t = useTranslations();

    if (items.length === 0) {
        return (
            <EmptyLibrary
                text={t("emptyFolder")}
                buttonLabel={t("add")}
                onClick={onCreate}
            />
        )
    }

    return (
        <div className="flex flex-col gap-[20px]">
            {items.map(module => (
                <ModuleView
                    key={module.id}
                    id={module.id}
                    displayName={module.display_name}
                    onEdit={onEdit}
                    onSaveToFolderModal={onSaveToFolderModal}
                    onDelete={onDelete}
                    showOptions={showOptions}
                />
            ))}
        </div>
    );
};

export default ModulesListView;