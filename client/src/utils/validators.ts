import { ERROR_CODES } from "./api";

export const validateEmail = (email: string, t: (key: string) => string): string | null => {
    const trimmed = email.trim();

    if (trimmed.length === 0) {
        return t("errors.EMAIL_EMPTY");
    }

    if (trimmed.length > 320) {
        return t("errors.EMAIL_TOO_LONG");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return t("errors.EMAIL_INVALID_FORMAT");
    }

    return null;
};

export const validateFullName = (name: string, t: (key: string) => string): string  | null => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return t("errors.FULL_NAME_EMPTY");
    }

    if (trimmed.length > 100) {
        return t("errors.FULL_NAME_TOO_LONG");
    }

    if (name.trim().length < 2) {
        return t("errors.FULL_NAME_TOO_SHORT");
    }

    const invalidChars = /[^\p{L}\p{M}\p{Zs}\-']/u;
    if (invalidChars.test(trimmed)) {
        return t("errors.FULL_NAME_INVALID_CHARACTERS");
    }

    return null;
};

export const validateFolderDisplayName = (v: string, t: (key: string) => string): string | null => {
    if (v.trim().length === 0) {
        return t(`errors.${ERROR_CODES.FOLDER_DISPLAY_NAME_EMPTY}`);
    }

    return null;
};