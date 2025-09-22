"use client";

import { Module } from "@/utils/Module";
import ModuleView from "./ModuleView";
import { useTranslations } from "next-intl";
import EmptyLibrary from "./EmptyLibrary";

type ModulesListViewProps = {
    items: Module[];
    onCreate: () => void;
}

const ModulesListView = ({
    items,
    onCreate,
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
                />
            ))}
        </div>
    );
};

export default ModulesListView;