"use client";

import { Folder } from "@/utils/Folder";
import { LibraryTabs } from "@/utils/LibraryTabs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import Modal from "./Modal";
import ValidatedInput from "./ValidatedInput";
import FoldersListView from "./FoldersListView";
import LibraryTabsComponent from "./LibraryTabsComponent";
import { validateFolderDisplayName } from "@/utils/validators";
import { Module } from "@/utils/Module";
import ModulesListView from "./ModulesListView";
import { useRouter } from "next/navigation";
import ChecklistView from "./ChecklistView";
import { ModalTitleAlignment } from "@/utils/ModalTitleAlignment";
import { createFolderApi, deleteFolderApi, listFoldersByModuleApi, renameFolderApi } from "@/utils/folder.api";
import { deleteModuleApi, updateModuleFoldersApi } from "@/utils/module.api";

interface LibraryViewProps {
    initialFolders: Folder[],
    initialModules: Module[],
};

const LibraryView = ({
    initialFolders,
    initialModules
}: LibraryViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<LibraryTabs>(LibraryTabs.FOLDERS);

    const [folders, setFolders] = useState<Folder[]>(initialFolders);
    const [modules, setModules] = useState<Module[]>(initialModules);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [foldersByModule, setFoldersByModule] = useState<number[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<Set<number>>(new Set());
    const [isSaveToFolderModalOpen, setIsSaveToFolderModalOpen] = useState(false);

    const [folderDisplayName, setFolderDisplayName] = useState("");
    const [folderDisplayNameError, setFolderDisplayNameError] = useState<string | null>(null);

    const createFolder = async (displayName: string) => {
        try {
            const { data, error } = await createFolderApi(displayName);

            if (error) {
                setFolderDisplayNameError(t(`errors.${error.message}`));
            } else if (data) {
                setFolders(prev => [...prev, data]);
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const deleteFolder = async (id: number) => {
        try {
            const { error } = await deleteFolderApi(id);

            if (!error) {
                setFolders(prev => prev.filter(f => f.id !== id))
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const renameFolder = async (id: number, newDisplayName: string) => {
        try {
            const { data, error } = await renameFolderApi(id, newDisplayName);

            if (error) {
                return error.message;
            }
            
            if (data) {
                setFolders(prev => prev.map(f => f.id === data.id ? { ...f, display_name: data.display_name } : f));
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const createModule = () => router.push("/library/module/create");

    const editModule = (id: number) => {
        router.push(`/library/module/${id}/edit`);
    };

    const deleteModule = async (id: number) => {
        try {
            const { error } = await deleteModuleApi(id);

            if (!error) {
                setModules(prev => prev.filter(m => m.id !== id))
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const openSaveToFolderModal = async (id: number) => {
        setActiveModuleId(id);

        const { data } = await listFoldersByModuleApi(id);
        const foldersId = data ?? [];
        setFoldersByModule(foldersId);
        setSelectedFolders(new Set(foldersId));
        setIsSaveToFolderModalOpen(true);
    };

    const handleSubmitFoldersToModule = async (selected: Set<number>, newFolderDisplayName: string) => {
        if (!activeModuleId) {
            return;
        }

        try {
            let updatedFolders = [...folders];
            let updatedSelected = new Set(selected);

            if (newFolderDisplayName.trim()) {
                const { data } = await createFolderApi(newFolderDisplayName);

                if (data) {
                    updatedFolders = [...folders, data];
                    setFolders(updatedFolders);

                    updatedSelected.add(data.id);
                    setSelectedFolders(updatedSelected);
                }
            }

            const foldersByModuleMap = new Map<number, boolean>(
                updatedFolders.map(f => [f.id, updatedSelected.has(f.id)])
            );

            await updateModuleFoldersApi(activeModuleId, foldersByModuleMap);

            setFoldersByModule(updatedFolders.filter(f => updatedSelected.has(f.id)).map(f => f.id));
            setIsSaveToFolderModalOpen(false);
        }
        catch (e) {
            alert(e);
        }
    };

    const renderTab = (tab: LibraryTabs) => {
        switch (tab) {
            case LibraryTabs.FOLDERS:
                return (
                    <FoldersListView
                        items={folders}
                        onCreate={() => setIsNewFolderModalOpen(true)}
                        onDelete={deleteFolder}
                        onRename={renameFolder}
                    />
                );

            case LibraryTabs.MODULES:
                return (
                    <ModulesListView
                        items={modules}
                        onCreate={createModule}
                        onEdit={editModule}
                        onSaveToFolderModal={openSaveToFolderModal}
                        onDelete={deleteModule}
                    />
                );
        }
    };

    return (
        <>
            <div className="mt-[50px] mx-[130px]">
                <h1 className="font-h1">{t("yourLibrary")}</h1>

                <div className="flex justify-between items-center gep-[15px] mt-[30px]">
                    <LibraryTabsComponent
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {folders.length !== 0 && activeTab === LibraryTabs.FOLDERS &&
                        <Button
                            label={t("createFolder")}
                            size={ButtonSize.MEDIUM}
                            type={ButtonType.PRIMARY}
                            htmlType="button"
                            onClick={() => setIsNewFolderModalOpen(true)}
                        />
                    }

                    {modules.length !== 0 && activeTab === LibraryTabs.MODULES &&
                        <Button
                            label={t("createModule")}
                            size={ButtonSize.MEDIUM}
                            type={ButtonType.PRIMARY}
                            htmlType="button"
                            onClick={createModule}
                        />
                    }
                </div>

                <div className="mt-[20px]">
                    {renderTab(activeTab)}
                </div>
            </div>
            {isNewFolderModalOpen && (
                <Modal
                    title={t("newFolder")}
                    onClose={() => setIsNewFolderModalOpen(false)}
                >
                    <form onSubmit={async e => {
                        e.preventDefault();
                        await createFolder(folderDisplayName);
                        setIsNewFolderModalOpen(false);
                        setFolderDisplayName("");
                    }}>
                        <ValidatedInput
                            value={folderDisplayName}
                            setValue={setFolderDisplayName}
                            validate={validateFolderDisplayName}
                            type="text"
                            placeholder={t("enterDisplayName")}
                            showSuccess
                            serverError={folderDisplayNameError}
                        />

                        <div className="flex items-center justify-center gap-[20px] mt-[20px]">
                            <Button
                                label={t("cancel")}
                                size={ButtonSize.NORMAL}
                                type={ButtonType.STROKE}
                                htmlType="button"
                                onClick={() => setIsNewFolderModalOpen(false)}
                            />
                            <Button
                                label={t("create")}
                                size={ButtonSize.NORMAL}
                                type={ButtonType.PRIMARY}
                                htmlType="submit"
                            />
                        </div>
                    </form>
                </Modal>
            )}
            {isSaveToFolderModalOpen && (
                <Modal
                    title={t("saveToFolder")}
                    titleAlign={ModalTitleAlignment.LEFT}
                    onClose={() => {
                        setIsSaveToFolderModalOpen(false);
                        setActiveModuleId(null);
                    }}
                >
                    <ChecklistView
                        items={folders}
                        selected={selectedFolders}
                        setSelected={setSelectedFolders}
                        onSubmit={handleSubmitFoldersToModule}
                        placeholder={t("createNewFolder")}
                    />
                </Modal>
            )}
        </>
    );
};

export default LibraryView;