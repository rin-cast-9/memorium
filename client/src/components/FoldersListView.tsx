"use client";

import { Folder } from "@/utils/Folder";
import FolderView from "./FolderView";
import EmptyLibrary from "./EmptyLibrary";
import { useTranslations } from "next-intl";
import { ErrorCode } from "@/utils/api";

type FoldersListViewProps = {
    items: Folder[];
    onCreate: () => void;
    onDelete: (id: number) => void;
    onRename: (id: number, newDisplayName: string) => Promise<string | undefined>;
}

const FoldersListView = ({
    items,
    onCreate,
    onDelete,
    onRename,
}: FoldersListViewProps) => {
    const t = useTranslations();

    if (items.length === 0) {
        return (
            <EmptyLibrary
                text={t("emptyFolders")}
                buttonLabel={t("createFolder")}
                onClick={onCreate}
            />
        )
    }

    return (
        <div className="flex flex-col gap-[20px]">
            {items.map(folder => (
                <FolderView
                    key={folder.id}
                    id={folder.id}
                    displayName={folder.display_name}
                    onDelete={onDelete}
                    onRename={onRename}
                />
            ))}
        </div>
    );
};

export default FoldersListView;