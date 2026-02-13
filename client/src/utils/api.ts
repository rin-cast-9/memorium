export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const ERROR_CODES = {
    USER_EXISTS: "USER_EXISTS",
    FULL_NAME_EMPTY: "FULL_NAME_EMPTY",
    FULL_NAME_TOO_SHORT: "FULL_NAME_TOO_SHORT",
    FULL_NAME_TOO_LONG: "FULL_NAME_TOO_LONG",
    FULL_NAME_INVALID_CHARACTERS: "FULL_NAME_INVALID_CHARACTERS",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    USER_CREATION_FAILED: "USER_CREATION_FAILED",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    UNAUTHENTICATED: "UNAUTHENTICATED",
    NETWORK_ERROR: "NETWORK_ERROR",
    INVALID_REQUEST: "INVALID_REQUEST",
    INVALID_JSON: "INVALID_JSON",
    FOLDER_DISPLAY_NAME_EMPTY: "FOLDER_DISPLAY_NAME_EMPTY",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export type ApiError = {
    error: ErrorCode;
};

export type ApiResponse<T> = {
    data?: T;
    error?: { message: string; code: number };
};

export const parseApiResponse = async <T> (response: Response): Promise<{ data?: T; error?: ApiError }> => {
    if (response.status === 204) {
        return {};
    }

    let text: string;
    try {
        text = await response.text();
    }
    catch { 
        return { error: { error: ERROR_CODES.INVALID_JSON } };
    }

    if (!text) {
        return {};
    }

    let data: unknown;
    try {
        data = JSON.parse(text);
    }
    catch {
        return { error: { error: ERROR_CODES.INVALID_JSON } };
    }

    if (data && typeof data === "object" && "error" in data) {
        return { error: data as ApiError };
    }

    return { data: data as T };
};

export const parseApiResposneNew = async <T> (response: Response, expectedSuccessCode: number = 200): Promise<ApiResponse<T>> => {
    const code = response.status;

    if (code === 204) {
        return {};
    }

    let text: string;
    try {
        text = await response.text();
    }
    catch {
        return { error: { message: "Failed to read response", code } };
    }

    if (!text) {
        return code === expectedSuccessCode ? {} : { error: { message: "Empty response", code } };
    }

    let data: unknown;
    try {
        data = JSON.parse(text);
    }
    catch {
        return { error: { message: "Invalid JSON", code } };
    }

    if (code !== expectedSuccessCode) {
        const msg = (data as any)?.error ?? (data as any)?.message ?? `Unexpected error: ${code}`;
        return { error: { message: msg, code } };
    }

    return { data: data as T };
};