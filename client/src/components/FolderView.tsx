"use client";

import { useTranslations } from "next-intl";
import DropdownMenu from "./DropdownMenu";
import { ErrorCode } from "@/utils/api";
import Modal from "./Modal";
import { useState } from "react";
import ValidatedInput from "./ValidatedInput";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { validateFolderDisplayName } from "@/utils/validators";
import { useRouter } from "next/navigation";

type FolderViewProps = {
    id: number;
    displayName: string;
    onDelete: (id: number) => void;
    onRename: (id: number, newDisplayName: string) => Promise<ErrorCode | undefined>;
};

const FolderView = ({
    id,
    displayName,
    onDelete,
    onRename
}: FolderViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");
    const [newDisplayNameError, setNewDisplayNameError] = useState("");

    return (
        <>
            <div
                className="flex items-center justify-between bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] px-[30px] h-[90px] hover:cursor-pointer"
                onClick={() => router.push(`/library/folder/${id}`)}
            >
                <p className="font-content text-[var(--color-white)]">{displayName}</p>
                <DropdownMenu
                    trigger={
                        <button>
                            <img src="icons/icon-edit.svg" alt="edit" className="w-[16px] h-[16px] hover:cursor-pointer"/>
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
                            onClick: () => setIsDeleteConfirmationModalOpen(true),
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
                        setNewDisplayNameError((await onRename(id, newDisplayName)) ?? "");
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
            {isDeleteConfirmationModalOpen && (
                <Modal
                    title={t("deleteConfirmation")}
                    onClose={() => setIsDeleteConfirmationModalOpen(false)}
                >
                    <p className="font-content text-[var(--color-grey)] text-center ml-[20px] mr-[40px] mb-[30px]">{t("deleteDetails")}</p>
                    <div className="flex items-center justify-center gap-[20px]">
                        <Button
                            label={t("back")}
                            size={ButtonSize.NORMAL}
                            type={ButtonType.STROKE}
                            htmlType="button"
                            onClick={() => setIsDeleteConfirmationModalOpen(false)}
                        />
                        <Button
                            label={t("delete")}
                            size={ButtonSize.NORMAL}
                            type={ButtonType.DANGER}
                            htmlType="button"
                            onClick={() => {
                                onDelete(id);
                                setIsDeleteConfirmationModalOpen(false);
                            }}
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};

export default FolderView;