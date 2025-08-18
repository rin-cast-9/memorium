export const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const ERROR_CODES = {
    USER_EXISTS: "USER_EXISTS",
    FULL_NAME_EMPTY: "FULL_NAME_EMPTY",
    FULL_NAME_TOO_SHORT: "FULL_NAME_TOO_SHORT",
    FULL_NAME_TOO_LONG: "FULL_NAME_TOO_LONG",
    FULL_NAME_INVALID_CHARACTERS: "FULL_NAME_INVALID_CHARACTERS",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    USER_CREATION_FAILED: "USER_CREATION_FAILED",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    INVALID_REQUEST: "INVALID_REQUEST",
    INVALID_JSON: "INVALID_JSON",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export type ApiError = {
    error: ErrorCode;
};

export const parseApiResponse = async <T> (response: Response): Promise<{ data?: T; error?: ApiError }> => {
    let data: unknown;

    try {
        data = await response.json();
    }
    catch { 
        return { error: { error: ERROR_CODES.INVALID_JSON } };
    }

    if (data && typeof data === "object" && "error" in data) {
        return { error: data as ApiError };
    }

    return { data: data as T };
};