import { apiUrl, baseUrl, parseApiResposneNew } from "./api"
import { browserFetch, serverFetch } from "./ApiRequests"
import { Module } from "./Module";

export const createModuleApi = async (displayName: string) => {
    const res = await fetch(`/api/modules`, {
        method: "POST",
        body: JSON.stringify({ display_name: displayName }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Module>(res, 201);
};

export const deleteModuleApi = async (id: number) => {
    const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<void>(res, 204);
};

export const renameModuleApi = async (id: number, newDisplayName: string) => {
    const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        body: JSON.stringify({ new_display_name: newDisplayName }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Module>(res, 200);
};

export const getModuleApi = async (id: number) => {
    const res = await fetch(`/api/modules/${id}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<Module>(res, 200);
};

export const listModulesApi = async (cookie?: string) => {
    const res = await fetch(`${baseUrl}/api/modules`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: cookie ? { Cookie: cookie } : undefined,
    });

    return parseApiResposneNew<Module[]>(res, 200);
};

export const listModulesByFolderApi = async (folderId: number) => {
    const res = await fetch(`/api/folders/${folderId}/modules`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<number[]>(res, 200);
};

export const updateModuleFoldersApi = async (moduleId: number, foldersByModuleMap: Map<number, boolean>) => {
    const folderMap: Record<number, boolean> = {};

    foldersByModuleMap.forEach((selected, folderId) => {
        folderMap[folderId] = selected;
    });

    const res = await fetch(`/api/modules/${moduleId}/folders`, {
        method: "PUT",
        body: JSON.stringify({ folder_map: folderMap }),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    return parseApiResposneNew<void>(res, 204);
};