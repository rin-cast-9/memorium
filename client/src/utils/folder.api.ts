import { baseUrl, parseApiResposneNew,  } from "./api"
import { Folder } from "./Folder";

export const createFolderApi = async (displayName: string) => {
    const res = await fetch(`/api/folders`, {
        method: "POST",
        body: JSON.stringify({ display_name: displayName }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Folder>(res, 201);
};

export const deleteFolderApi = async (id: number) => {
    const res = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<void>(res, 204);
};

export const renameFolderApi = async (id: number, newDisplayName: string) => {
    const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ new_display_name: newDisplayName }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Folder>(res, 200);
};

export const getFolderApi = async (id: number) => {
    const res = await fetch(`/api/folders/${id}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Folder>(res, 200);
};

export const listFoldersApi = async (cookie?: string) => {
    const res = await fetch(`${baseUrl}/api/folders`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: cookie ? { Cookie: cookie } : undefined,
    });

    return parseApiResposneNew<Folder[]>(res, 200);
};

export const listFoldersByModuleApi = async (moduleId: number) => {
    const res = await fetch(`/api/modules/${moduleId}/folders`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<number[]>(res, 200);
};

export const updateFolderModulesApi = async (folderId: number, modulesByFolderMap: Map<number, boolean>) => {
    const moduleMap: Record<number, boolean> = {};

    modulesByFolderMap.forEach((selected, moduleId) => {
        moduleMap[moduleId] = selected;
    });

    const res = await fetch(`/api/folders/${folderId}/modules`, {
        method: "PUT",
        body: JSON.stringify({ module_map: moduleMap }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<void>(res, 204);
};