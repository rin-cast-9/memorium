import { baseUrl, parseApiResposneNew } from "./api"

export const registerApi = async (email: string, fullname: string, password: string) => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({ email: email, fullname: fullname, password: password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    return parseApiResposneNew<void>(res, 201);
};

type LoginResponse = {
    username: string;
};

export const loginApi = async (email: string, password: string) => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    return parseApiResposneNew<LoginResponse>(res, 200);
};

export const logoutApi = async () => {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    return parseApiResposneNew<void>(res, 200);
};