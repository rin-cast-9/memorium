"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { ModalTitleAlignment } from "@/utils/ModalTitleAlignment";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { useRouter } from "next/navigation";
import { Folder } from "@/utils/Folder";
import { createModuleApi, getFolderApi, getModuleApi, listModulesApi, listModulesByFolderApi, updateFolderModulesApi } from "@/utils/ApiRequests";
import ModulesListView from "./ModulesListView";
import { Module } from "@/utils/Module";
import ChecklistView from "./ChecklistView";

type FolderContentViewProps = {
    folderId: number;
};

const FolderContentView = ({
    folderId,
}: FolderContentViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [folder, setFolder] = useState<Folder | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [modulesByFolder, setModulesByFolder] = useState<number[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);

    useEffect(() => {
        const fetchFolder = async () => {
            const { data } = await getFolderApi(folderId);
            setFolder(data ?? null);
        };

        const fetchModules = async () => {
            const { data } = await listModulesApi();
            setModules(data ?? []);
        };

        const fetchModulesByFolder = async () => {
            const { data } = await listModulesByFolderApi(folderId);
            setModulesByFolder(data ?? []);
        };

        fetchFolder();
        fetchModules();
        fetchModulesByFolder();
    }, []);

    const handleSubmit = async (selected: Set<number>, newModuleDisplayName: string) => {
        try {
            let updatedModules = [...modules];
            let updatedSelected = new Set(selected);

            if (newModuleDisplayName.trim()) {
                const { data } = await createModuleApi(newModuleDisplayName);

                if (data) {
                    updatedModules = [...modules, data];
                    setModules(updatedModules);

                    updatedSelected.add(data.id);
                    setSelected(updatedSelected);
                }
            }
            const modulesByFolderMap = new Map<number, boolean>(
                updatedModules.map(m => [m.id, updatedSelected.has(m.id)])
            );

            await updateFolderModulesApi(folderId, modulesByFolderMap);

            setModulesByFolder(updatedModules.filter(m => updatedSelected.has(m.id)).map(m => m.id));

            setIsAddToFolderModalOpen(false);
        }
        catch (e) {
            alert(e);
        }
    };

    return (
        <div className="mt-[50px] mx-[130px]">
            <h1 className="font-h1 mb-[30px]">{folder?.display_name}</h1>

            <ModulesListView
                items={modules.filter(m => modulesByFolder.includes(m.id))}
                onCreate={() => setIsAddToFolderModalOpen(true)}
                onEdit={() => {}}
                onSaveToFolderModal={() => {}}
                onDelete={() => {}}
            />
        
            {isAddToFolderModalOpen && (
                <Modal
                    title={t("addToFolder")}
                    titleAlign={ModalTitleAlignment.LEFT}
                    onClose={() => setIsAddToFolderModalOpen(false)}
                >
                    <ChecklistView
                        items={modules}
                        selected={selected}
                        setSelected={setSelected}
                        onSubmit={handleSubmit}
                        placeholder={t("createNewModuleInFolder")}
                    />
                </Modal>
            )}

            <Button
                label={t("backToLibrary")}
                size={ButtonSize.SMALL}
                type={ButtonType.NEUTRAL}
                htmlType="button"
                onClick={() => router.push("/library")}
                icon={<img src="/icons/icon-arrow-left.svg" alt="back"/>}
                className="mt-[40px]"
            />
        </div>
    );
};

export default FolderContentView;