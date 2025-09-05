"use client";

import { Module } from "@/utils/Module";
import EmptyLibrary from "./EmptyLibrary";
import ModulesListView from "./ModulesListView";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { ModalTitleAlignment } from "@/utils/ModalTitleAlignment";
import ModulesChecklistView from "./ModulesChecklistView";
import { createModuleApi } from "@/utils/ApiRequests";

type FolderContentViewProps = {
    modules: Module[];
    modulesByFolder: Module[];
    onSubmit: (modulesByFolderMap: Map<number, boolean>) => void;
    onModuleCreated?: (module: Module) => void;
};

const FolderContentView = ({
    modules,
    modulesByFolder,
    onSubmit,
    onModuleCreated,
}: FolderContentViewProps) => {
    const t = useTranslations();

    const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
    const [selectionMap, setSelectionMap] = useState<Map<number, boolean>>(new Map());

    useEffect(() => {
        setSelectionMap(
            new Map(modules.map(m => [m.id, modulesByFolder.some(f => f.id === m.id)]))
        );
    }, [modules, modulesByFolder]);

    const createModule = async (displayName: string): Promise<Module | null> => {
        try {
            const { data, error } = await createModuleApi(displayName);
            if (error) {
                alert(`Error: ${error.error}`);
                return null;
            }

            if (data) {
                onModuleCreated?.(data);
                setSelectionMap(prev => new Map(prev).set(data.id, true));
                setIsAddToFolderModalOpen(false);
                return data;
            }
        } catch (e) {
            alert(e);
        }

        return null;
    };

    return (
        <>
            {modulesByFolder.length === 0 ? (
                <EmptyLibrary
                    text={t("emptyFolder")}
                    buttonLabel={t("add")}
                    onClick={() => setIsAddToFolderModalOpen(true)}
                />
            ) : (
                <ModulesListView
                    items={modulesByFolder}
                />
            )}
            {isAddToFolderModalOpen && (
                <Modal
                    title={t("addToFolder")}
                    titleAlign={ModalTitleAlignment.LEFT}
                    onClose={() => setIsAddToFolderModalOpen(false)}
                >
                    <ModulesChecklistView
                        modules={modules}
                        selectionMap={selectionMap}
                        setSelectionMap={setSelectionMap}
                        onCreate={createModule}
                        onSubmit={onSubmit}
                    />
                </Modal>
            )}
        </>
    );
};

export default FolderContentView;