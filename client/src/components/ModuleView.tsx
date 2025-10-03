import { useTranslations } from "next-intl";
import DropdownMenu from "./DropdownMenu";
import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { useRouter } from "next/navigation";

type ModuleViewProps = {
    id: number;
    displayName: string;
    onEdit: (id: number) => void;
    onSaveToFolderModal: (id: number) => void;
    onDelete: (id: number) => void;
}

const ModuleView = ({
    id,
    displayName,
    onEdit,
    onSaveToFolderModal,
    onDelete,
}: ModuleViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);

    return (
        <>
            <div
                className="flex items-center justify-between bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] px-[30px] h-[90px] hover:cursor-pointer"
                onClick={() => router.push(`/library/module/${id}`)}
            >
                <p className="font-content text-[var(--color-white)]">{displayName}</p>
                <DropdownMenu
                    trigger={
                        <button>
                            <img src="/icons/icon-edit.svg" alt="edit" className="w-[16px] h-[16px]"/>
                        </button>
                    }
                    items={[
                        {
                            label: t("edit"),
                            onClick: () => onEdit(id),
                            icon: "/icons/icon-edit-1.svg"
                        },
                        {
                            label: t("saveToFolder"),
                            onClick: () => onSaveToFolderModal(id),
                            icon: "/icons/icon-folder.svg"
                        },
                        {
                            label: t("delete"),
                            onClick: () => setIsDeleteConfirmationModalOpen(true),
                            icon: "/icons/icon-module-1.svg"
                        }
                    ]}
                />
            </div>
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

export default ModuleView;