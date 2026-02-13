import { Answer } from "./Answer";
import { apiUrl, baseUrl, ERROR_CODES, parseApiResponse } from "./api";
import { CardApi } from "./Card";
import { FinishedTestSummary } from "./FinishedTestSummary";
import { Folder } from "./Folder";
import { Module, ModuleCount } from "./Module";
import { ReviewResult } from "./ReviewResult";
import { StartReviewResponse } from "./StartReviewRequest";
import { StartTestResponse } from "./StartTestResponse";
import { redirect } from "next/navigation";

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers, credentials: "include" });
    return response;
};

export const browserFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
    });

    if (res.status !== 401) {
        return res;
    }

    const refresh = await fetch(`${apiUrl}/refresh`, {
        method: "POST",
        credentials: "include",
    });

    if (!refresh.ok) {
        window.location.href = "/auth";
        return new Response(JSON.stringify({ error: {message: ERROR_CODES.UNAUTHENTICATED, code: 401 } }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include",
    });
};

export const serverFetch = async (url: string, cookie: string, options: RequestInit = {}) => {
    let res = await fetch(url, {
        ...options,
        headers: { Cookie: cookie },
        cache: "no-store",
    });

    if (res.status !== 401) {
        return res;
    }

    const refresh = await fetch(`${apiUrl}/refresh`, {
        method: "POST",
        headers: { Cookie: cookie },
        cache: "no-store",
    });

    if (!refresh.ok) {
        redirect("/auth");
    }

    return fetch(url, {
        ...options,
        headers: { Cookie: cookie },
        cache: "no-store",
    });
};

const fetchWithRefresh = async (url: string, options: RequestInit = {}) => {
    const response = await apiFetch(url, options);

    if (response.status === 401) {
        const refreshResponse = await apiFetch(`${apiUrl}/refresh`, {
            method: "POST",
            headers: { "X-Refresh": "1" },
            credentials: "include",
        });

        if (refreshResponse.ok) {
            return apiFetch(url, options);
        }

        if (typeof window !== "undefined") {
            window.location.href = "/auth";
        }
    }

    return response;
};

export const listCardsByModuleApi = async (moduleId: number) => {
    const response = await fetchWithRefresh(`${apiUrl}/cards/module/${moduleId}`, {
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
    const response = await fetchWithRefresh(`${apiUrl}/cards/${cardId}`, {
        method: "GET"
    });

    return parseApiResponse<CardApi>(response);
};

export const createCardApi = async (moduleId: number, front: string, back: string) => {
    const response = await fetchWithRefresh(`${apiUrl}/cards`, {
        method: "POST",
        body: JSON.stringify({ module_id: moduleId, front: front, back: back })
    });

    return parseApiResponse<CardApi>(response);
};

export const deleteCardApi = async (cardId: number) => {
    const response = await fetchWithRefresh(`${apiUrl}/cards/${cardId}`, {
        method: "DELETE"
    });

    return parseApiResponse<{}>(response);
};

export const editCardApi = async (cardId: number, front: string, back: string) => {
    const response = await fetchWithRefresh(`${apiUrl}/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify({ front: front, back: back })
    });

    return parseApiResponse<CardApi>(response);
};

export const startTestApi = async (moduleId: number, isReviewOnly: boolean) => {
    const response = await fetchWithRefresh(`${apiUrl}/test/start`, {
        method: "POST",
        body: JSON.stringify({
            module_id: moduleId,
            is_review_only: isReviewOnly,
        }),
    });

    return parseApiResponse<StartTestResponse>(response);
};

export const finishTestApi = async (testId: number, answers: Answer[]) => {
    const response = await fetchWithRefresh(`${apiUrl}/test/${testId}/finish`, {
        method: "POST",
        body: JSON.stringify({ answers }),
    });

    return parseApiResponse<FinishedTestSummary>(response);
};

export const startReviewApi = async (moduleId: number, reviewType: number) => {
    const response = await fetchWithRefresh(`${apiUrl}/review/start`, {
        method: "POST",
        body: JSON.stringify({
            module_id: moduleId,
            review_type: reviewType,
        }),
    });

    return parseApiResponse<StartReviewResponse>(response);
};

export const finishReviewApi = async (moduleId: number, results: ReviewResult[]) => {
    const response = await fetchWithRefresh(`${apiUrl}/review/${moduleId}/finish`, {
        method: "POST",
        body: JSON.stringify({ review_results: results }),
    });

    return parseApiResponse<void>(response);
};

export const getProgressByModuleApi = async (moduleId: number) => {
    const response = await fetchWithRefresh(`${apiUrl}/progress/${moduleId}`, {
        method: "GET",
    });

    return parseApiResponse<Record<number, number>>(response);
};