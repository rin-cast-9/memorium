import { apiUrl, parseApiResponse } from "./api";
import { Folder } from "./Folder";
import { Module } from "./Module";

const getAuthToken = () => localStorage.getItem("token") || "";

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
    };

    const response = await fetch(url, { ...options, headers });
    return response;
};

export const listFoldersApi = async () => {
    const response = await apiFetch(`${apiUrl}/folders`, {
        method: "GET",
    });

    return parseApiResponse<Folder[]>(response);
}

export const createModuleApi = async (displayName: string) => {
    const response = await apiFetch(`${apiUrl}/modules`, {
        method: "POST",
        body: JSON.stringify({ display_name: displayName }),
    });

    return parseApiResponse<Module>(response);
};

export const deleteModuleApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/modules/${id}`, {
        method: "DELETE",
    });

    return parseApiResponse<{}>(response);
};

export const renameModuleApi = async (id: number, newDisplayName: string) => {
    const response = await apiFetch(`${apiUrl}/modules/${id}`, {
        method: "PUT",
        body: JSON.stringify({ new_display_name: newDisplayName }),
    });

    return parseApiResponse<Module>(response);
};

export const getModuleApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/modules/${id}`, {
        method: "GET",
    });

    return parseApiResponse<Module>(response);
};

export const listModulesApi = async () => {
    const response = await apiFetch(`${apiUrl}/modules`, {
        method: "GET",
    });

    return parseApiResponse<Module[]>(response);
};

export const listModulesByFolderApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/folders/${id}/modules`, {
        method: "GET",
    });

    return parseApiResponse<number[]>(response);
};

export const updateFolderModulesApi = async (id: number, modulesByFolderMap: Map<number, boolean>) => {
    const moduleMap: Record<number, boolean> = {};

    modulesByFolderMap.forEach((selected, moduleId) => {
        moduleMap[moduleId] = selected;
    });

    const response = await apiFetch(`${apiUrl}/folders/${id}/modules`, {
        method: "POST",
        body: JSON.stringify({ module_map: moduleMap }),
    });

    return parseApiResponse<{}>(response);
};