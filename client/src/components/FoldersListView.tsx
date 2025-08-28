"use client";

import { Folder } from "@/utils/Folder";
import FolderView from "./FolderView";

type FoldersListViewProps = {
    items: Folder[];
    onDeleted: (id: number) => void;
    onRenamed: (id: number, newDisplayName: string) => void;
}

const FoldersListView = ({
    items,
    onDeleted,
    onRenamed,
}: FoldersListViewProps) => {
    return (
        <div className="flex flex-col gap-[20px]">
            {items.map(folder => (
                <FolderView
                    key={folder.id}
                    id={folder.id}
                    displayName={folder.display_name}
                    onDeleted={onDeleted}
                    onRenamed={onRenamed}
                />
            ))}
        </div>
    );
};

export default FoldersListView;