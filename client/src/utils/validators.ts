export const validateEmail = (email: string): string | null => {
    const trimmed = email.trim();

    if (trimmed.length === 0) {
        return "Email cannot be empty";
    }

    if (trimmed.length > 320) {
        return "Email too long";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return "Invalid email format";
    }

    return null;
};

export const validateFullName = (name: string): string  | null => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return "Full name cannot be empty";
    }

    if (trimmed.length > 100) {
        return "Full name too long.";
    }

    if (name.trim().length < 2) {
        return "Full name too short";
    }

    const invalidChars = /[^\p{L}\p{M}\p{Zs}\-']/u;
    if (invalidChars.test(trimmed)) {
        return "Full name contains invalid characters";
    }

    return null;
};