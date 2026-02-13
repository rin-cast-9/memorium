import { AuthRefreshBoundary } from "@/components/AuthRefreshBoundary";
import LibraryView from "@/components/LibraryView";
import { ERROR_CODES } from "@/utils/api";
import { listFoldersApi } from "@/utils/folder.api";
import { listModulesApi } from "@/utils/module.api";
import { headers } from "next/headers";

const LibraryPage = async () => {    
    const h = headers();
    const cookie = (await h).get("cookie") ?? "";

    const { data: folders, error: foldersFetchError } = await listFoldersApi(cookie);
    const { data: modules, error: modulesFetchError } = await listModulesApi(cookie);

    if (foldersFetchError?.code === 401 || modulesFetchError?.code === 401) {
        return <AuthRefreshBoundary />;
    }

    return (
        <LibraryView
            initialFolders={folders ?? []}
            initialModules={modules ?? []}
        />
    );
};

export default LibraryPage;