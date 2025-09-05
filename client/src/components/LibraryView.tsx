"use client";

import { apiUrl, parseApiResponse } from "@/utils/api";
import { Folder } from "@/utils/Folder";
import { LibraryTabs } from "@/utils/LibraryTabs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import EmptyLibrary from "./EmptyLibrary";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import Modal from "./Modal";
import ValidatedInput from "./ValidatedInput";
import FoldersListView from "./FoldersListView";
import LibraryTabsComponent from "./LibraryTabsComponent";
import { validateFolderDisplayName } from "@/utils/validators";
import { createModuleApi, listFoldersApi, listModulesApi, listModulesByFolderApi, updateFolderModulesApi } from "@/utils/ApiRequests";
import { Module } from "@/utils/Module";
import FolderContentView from "./FolderContentView";
import ModulesListView from "./ModulesListView";

const LibraryView = () => {
    const t = useTranslations();

    const [activeTab, setActiveTab] = useState<LibraryTabs>(LibraryTabs.FOLDERS);
    const handleSetActiveTab = (tab: LibraryTabs) => {
        setActiveTab(tab);
        setSelectedFolderId(null);
    };

    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [modulesByFolder, setModulesByFolder] = useState<Module[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [folderDisplayName, setFolderDisplayName] = useState("");

    const [folderDisplayNameError, setFolderDisplayNameError] = useState<string | null>(null);
    const createFolder = async (displayName: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${apiUrl}/folders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ display_name: displayName })
            });

            const { data, error } = await parseApiResponse<Folder>(response);

            if (error) {
                setFolderDisplayNameError(t(`errors.${error.error}`));
            } else if (data) {
                setFolders(prev => [...prev, data]);
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const handleModuleCreated = (module: Module) => {
        setModules(prev => (prev.some(m => m.id === module.id) ? prev : [...prev, module]));
    }

    const handleUpdateFolderModules = async (selectionMap: Map<number, boolean>) => {
        try {
            if (selectedFolderId !== null) {
                await updateFolderModulesApi(selectedFolderId, selectionMap);
                const { data } = await listModulesByFolderApi(selectedFolderId);
                const idSet = new Set<number>(data);
                const modulesInFolder = modules.filter(m => idSet.has(m.id));
                setModulesByFolder(modulesInFolder);
            }
        } catch (e) {
            alert(e);
        }
    };

    useEffect(() => {
        const fetchFolders = async () => {
            setLoading(true);
            try {
                const { data, error } = await listFoldersApi();

                if (error) {
                    setFolders([]);
                } else if (data) {
                    setFolders(data);
                }
            }
            finally {
                setLoading(false);
            }
        };
        const fetchModules = async () => {
            setLoading(true);
            try {
                const { data, error } = await listModulesApi();
                
                if (error) {
                    setModules([]);
                } else if (data) {
                    setModules(data);
                }
            }
            finally {
                setLoading(false);
            }
        };
            
        fetchFolders();
        fetchModules();
    }, [activeTab]);

    useEffect(() => {
        if (selectedFolderId === null) {
            return;
        }

        const fetch = async () => {
            setLoading(true);
            try {
                const { data } = await listModulesByFolderApi(selectedFolderId);
                const idSet = new Set<number>(data);
                const modulesInFolder = modules.filter(m => idSet.has(m.id));
                setModulesByFolder(modulesInFolder);
            }
            finally {
                setLoading(false);
            }
        };

        fetch();
    }, [selectedFolderId]);

    const renderTab = (tab: LibraryTabs, folders: Folder[]) => {
        switch (tab) {
            case LibraryTabs.FOLDERS:
                if (folders.length === 0) {
                    return (
                        <EmptyLibrary
                            text={t("emptyFolders")}
                            buttonLabel={t("create")}
                            onClick={() => {setIsNewFolderModalOpen(true)}}
                        />
                    );
                }

                if (selectedFolderId !== null) {
                    const folder = folders.find(f => f.id === selectedFolderId);
                    if (!folder) {
                        setSelectedFolderId(null);
                        return null;
                    }

                    return (
                        <FolderContentView
                            modules={modules}
                            modulesByFolder={modulesByFolder}
                            onSubmit={handleUpdateFolderModules}
                            onModuleCreated={handleModuleCreated}
                        />
                    );
                }

                return (
                    <FoldersListView
                        items={folders}
                        onDeleted={id => setFolders(prev => prev.filter(f => f.id !== id))}
                        onRenamed={(id, newDisplayName) => {
                            setFolders(prev => prev.map(f => f.id === id ? { ...f, display_name: newDisplayName } : f));
                        }}
                        onSelected={id => setSelectedFolderId(id)}
                    />
                );

            case LibraryTabs.MODULES:
                return modules.length === 0 ? (
                    <EmptyLibrary
                        text={t("emptyModules")}
                        buttonLabel={t("create")}
                        onClick={() => {}}
                    />
                ) : (
                    <ModulesListView
                        items={modules}
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
                        setActiveTab={handleSetActiveTab}
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
                            onClick={() => {}}
                        />
                    }
                </div>

                <div className="mt-[20px]">
                    {loading ? (
                        <p className="text-[var(--color-grey)] font-content">{t("loading")}</p>
                    ) : (
                        renderTab(activeTab, folders)
                    )}
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
                        setSelectedFolderId(null);
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
        </>
    );
};

export default LibraryView;