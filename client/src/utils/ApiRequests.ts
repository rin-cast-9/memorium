import { Answer } from "./Answer";
import { apiUrl, parseApiResponse } from "./api";
import { CardApi } from "./Card";
import { FinishedTestSummary } from "./FinishedTestSummary";
import { Folder } from "./Folder";
import { Module, ModuleCount } from "./Module";
import { ReviewResult } from "./ReviewResult";
import { StartReviewResponse } from "./StartReviewRequest";
import { StartTestResponse } from "./StartTestResponse";

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

export const createFolderApi = async (displayName: string) => {
    const response = await apiFetch(`${apiUrl}/folders`, {
        method: "POST",
        body: JSON.stringify({ display_name: displayName }),
    });

    return parseApiResponse<Folder>(response);
};

export const deleteFolderApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/folders/${id}`, {
        method: "DELETE",
    });

    return parseApiResponse<{}>(response);
};

export const renameFolderApi = async (id: number, newDisplayName: string) => {
    const response = await apiFetch(`${apiUrl}/folders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ new_display_name: newDisplayName }),
    });

    return parseApiResponse<Folder>(response);
};

export const listFoldersApi = async () => {
    const response = await apiFetch(`${apiUrl}/folders`, {
        method: "GET",
    });

    return parseApiResponse<Folder[]>(response);
};

export const getFolderApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/folders/${id}`, {
        method: "GET",
    });

    return parseApiResponse<Folder>(response);
};

export const listFoldersByModuleApi = async (id: number) => {
    const response = await apiFetch(`${apiUrl}/modules/${id}/folders`, {
        method: "GET",
    });

    return parseApiResponse<number[]>(response);
};

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
        method: "PUT",
        body: JSON.stringify({ module_map: moduleMap }),
    });

    return parseApiResponse<{}>(response);
};

export const updateModuleFoldersApi = async (id: number, foldersByModuleMap: Map<number, boolean>) => {
    const folderMap: Record<number, boolean> = {};

    foldersByModuleMap.forEach((selected, folderId) => {
        folderMap[folderId] = selected;
    });

    const response = await apiFetch(`${apiUrl}/modules/${id}/folders`, {
        method: "PUT",
        body: JSON.stringify({ folder_map: folderMap })
    });

    return parseApiResponse<{}>(response);
};

export const listCardsByModuleApi = async (moduleId: number) => {
    const response = await apiFetch(`${apiUrl}/cards/module/${moduleId}`, {
        method: "GET"
    });

    return parseApiResponse<CardApi[]>(response);
};

export const countCardsByModuleApi = async (moduleId: number) => {
    const response = await apiFetch(`${apiUrl}/modules/${moduleId}/count`, {
        method: "GET"
    });

    return parseApiResponse<ModuleCount>(response);
};

export const getCardApi = async (cardId: number) => {
    const response = await apiFetch(`${apiUrl}/cards/${cardId}`, {
        method: "GET"
    });

    return parseApiResponse<CardApi>(response);
};

export const createCardApi = async (moduleId: number, front: string, back: string) => {
    const response = await apiFetch(`${apiUrl}/cards`, {
        method: "POST",
        body: JSON.stringify({ module_id: moduleId, front: front, back: back })
    });

    return parseApiResponse<CardApi>(response);
};

export const deleteCardApi = async (cardId: number) => {
    const response = await apiFetch(`${apiUrl}/cards/${cardId}`, {
        method: "DELETE"
    });

    return parseApiResponse<{}>(response);
};

export const editCardApi = async (cardId: number, front: string, back: string) => {
    const response = await apiFetch(`${apiUrl}/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify({ front: front, back: back })
    });

    return parseApiResponse<CardApi>(response);
};

export const startTestApi = async (moduleId: number, isReviewOnly: boolean) => {
    const response = await apiFetch(`${apiUrl}/test/start`, {
        method: "POST",
        body: JSON.stringify({
            module_id: moduleId,
            is_review_only: isReviewOnly,
        }),
    });

    return parseApiResponse<StartTestResponse>(response);
};

export const finishTestApi = async (testId: number, answers: Answer[]) => {
    const response = await apiFetch(`${apiUrl}/test/${testId}/finish`, {
        method: "POST",
        body: JSON.stringify({ answers }),
    });

    return parseApiResponse<FinishedTestSummary>(response);
};

export const startReviewApi = async (moduleId: number, reviewType: number) => {
    const response = await apiFetch(`${apiUrl}/review/start`, {
        method: "POST",
        body: JSON.stringify({
            module_id: moduleId,
            review_type: reviewType,
        }),
    });

    return parseApiResponse<StartReviewResponse>(response);
};

export const finishReviewApi = async (moduleId: number, results: ReviewResult[]) => {
    const response = await apiFetch(`${apiUrl}/review/${moduleId}/finish`, {
        method: "POST",
        body: JSON.stringify({ review_results: results }),
    });

    return parseApiResponse<void>(response);
};

export const getProgressByModuleApi = async (moduleId: number) => {
    const response = await apiFetch(`${apiUrl}/progress/${moduleId}`, {
        method: "GET",
    });

    return parseApiResponse<Record<number, number>>(response);
};