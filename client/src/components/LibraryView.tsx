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

const LibraryView = () => {
    const t = useTranslations();

    const [activeTab, setActiveTab] = useState<LibraryTabs>(LibraryTabs.FOLDERS);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [modules, setModules] = useState<string[]>([]);
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

    useEffect(() => {
        if (activeTab === LibraryTabs.FOLDERS) {
            const fetchFolders = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem("token");
                    const reponse = await fetch(`${apiUrl}/folders`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    });

                    const { data, error } = await parseApiResponse<Folder[]>(reponse);

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
            fetchFolders();
        }
    }, [activeTab]);

    const renderTab = (tab: LibraryTabs, folders: Folder[]) => {
        switch (tab) {
            case LibraryTabs.FOLDERS:
                return folders.length === 0 ? (
                    <EmptyLibrary
                        text={t("emptyFolders")}
                        onClick={() => {setIsNewFolderModalOpen(true)}}
                    />
                ) : (
                    <FoldersListView
                        items={folders}
                        onDeleted={id => setFolders(prev => prev.filter(f => f.id !== id))}
                        onRenamed={(id, newDisplayName) => {
                            setFolders(prev => prev.map(f => f.id === id ? { ...f, display_name: newDisplayName } : f));
                        }}
                    />
                );

            case LibraryTabs.MODULES:
                return null;
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