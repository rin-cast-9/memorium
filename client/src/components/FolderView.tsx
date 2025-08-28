"use client";

import { useTranslations } from "next-intl";
import DropdownMenu from "./DropdownMenu";
import { apiUrl, parseApiResponse } from "@/utils/api";
import { Folder } from "@/utils/Folder";
import Modal from "./Modal";
import { useState } from "react";
import ValidatedInput from "./ValidatedInput";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { validateFolderDisplayName } from "@/utils/validators";

type FolderViewProps = {
    id: number;
    displayName: string;
    onDeleted: (id: number) => void;
    onRenamed: (id: number, newDisplayName: string) => void;
}

const FolderView = ({
    id,
    displayName,
    onDeleted,
    onRenamed,
}: FolderViewProps) => {
    const t = useTranslations();

    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");
    const [newDisplayNameError, setNewDisplayNameError] = useState("");

    const deleteFolder = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${apiUrl}/folders/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                }
            });

            type DeleteFolderResponse = {};
            const { error } = await parseApiResponse<DeleteFolderResponse>(response);

            if (error) {
                console.log(t(`errors.${error.error}`));
            } else {
                onDeleted(id);
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const renameFolder = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${apiUrl}/folders/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ new_display_name: newDisplayName })
            });

            const { data, error } = await parseApiResponse<Folder>(response);

            if (error) {
                setNewDisplayNameError(t(`errors.${error.error}`));
            } 
            
            if (data) {
                onRenamed(data.id, data.display_name);
            }
        }
        catch (e) {
            alert(e);
        }
    };

    return (
        <>
            <div
                className="flex items-center justify-between bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] px-[30px] h-[90px]"
            >
                <p className="font-content text-[var(--color-white)]">{displayName}</p>
                <DropdownMenu
                    trigger={
                        <button>
                            <img src="icons/icon-edit.svg" alt="edit" className="w-[16px] h-[16px]"/>
                        </button>
                    }
                    items={[
                        {
                            label: t("edit"),
                            onClick: () => {
                                setIsRenameFolderModalOpen(true);
                                setNewDisplayName(displayName);
                            },
                            icon: "icons/icon-edit-1.svg"
                        },
                        {
                            label: t("delete"),
                            onClick: () => deleteFolder(),
                            icon: "icons/icon-module-1.svg"
                        }
                    ]}
                />
            </div>
            {isRenameFolderModalOpen && (
                <Modal
                    title={t("edit")}
                    onClose={() => setIsRenameFolderModalOpen(false)}
                >
                    <form onSubmit={async e => {
                        e.preventDefault();
                        await renameFolder();
                        setIsRenameFolderModalOpen(false);
                    }}>
                        <ValidatedInput
                            value={newDisplayName}
                            setValue={setNewDisplayName}
                            validate={validateFolderDisplayName}
                            type="text"
                            placeholder={t("enterDisplayName")}
                            showSuccess
                            serverError={newDisplayNameError}
                        />

                        <div className="flex items-center justify-center gap-[20px] mt-[20px]">
                            <Button
                                label={t("cancel")}
                                size={ButtonSize.NORMAL}
                                type={ButtonType.STROKE}
                                htmlType="button"
                                onClick={() => setIsRenameFolderModalOpen(false)}
                            />
                            <Button
                                label={t("edit")}
                                size={ButtonSize.NORMAL}
                                type={displayName === newDisplayName ? ButtonType.DISABLED : ButtonType.PRIMARY}
                                htmlType="submit"
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export default FolderView;