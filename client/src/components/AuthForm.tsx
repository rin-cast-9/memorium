"use client";

import { AuthTabs } from "@/utils/AuthTabs";
import { useState } from "react";
import AuthTabsComponent from "./AuthTabsComponent";
import SignupTab from "./SignupTab";
import LoginTab from "./LoginTab";
import { useTranslations } from "next-intl";
import { apiUrl, ERROR_CODES, parseApiResponse } from "@/utils/api";

const AuthForm = () => {
    const t = useTranslations();

    const [activeTab, setActiveTab] = useState(AuthTabs.SIGNUP);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleSingupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFullNameError(null);
        setEmailError(null);

        type RegisterResponse = {};
        const response = await fetch(`${apiUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullname, password }),
        });

        const { error } = await parseApiResponse<RegisterResponse>(response);

        if (error) {
            switch (error.error) {
                case ERROR_CODES.FULL_NAME_EMPTY:
                case ERROR_CODES.FULL_NAME_TOO_SHORT:
                case ERROR_CODES.FULL_NAME_TOO_LONG:
                case ERROR_CODES.FULL_NAME_INVALID_CHARACTERS:
                    setFullNameError(t(`errors.${error.error}`));
                    break;

                case ERROR_CODES.USER_EXISTS:
                    setEmailError(t(`errors.${error.error}`));
                    break;

                default:
                    alert("Unknown error: " + error.error);
                    break;
            }
            return;
        }

        await login(email, password);
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await login(email, password);
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        type TokenResponse = { token: string; username: string; };

        const { data, error } = await parseApiResponse<TokenResponse>(response);

        if (error) {
            setLoginError(t(`errors.${error.error}`));
            return false;
        }

        if (data) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            window.location.href = "/ping";
            return true;
        }

        setLoginError(t(`errors.${ERROR_CODES.INTERNAL_SERVER_ERROR}`));
        return false;
    };

    return (
        <div className="bg-[var(--color-black-4)] flex flex-col min-h-screen">
            <div className="flex flex-1 justify-center">
                <div className="bg-[var(--color-black-4)] w-[580px] pt-[73px]">
                    <div className="text-[var(--color-white)] font-h1 text-center">
                        {t("greeting")}
                    </div>

                    <AuthTabsComponent
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {activeTab === AuthTabs.SIGNUP && (
                        <SignupTab
                            email={email}
                            password={password}
                            fullName={fullname}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            setFullName={setFullname}
                            onSubmit={handleSingupSubmit}
                            fullNameError={fullNameError}
                            emailError={emailError}
                        />
                    )}

                    {activeTab === AuthTabs.LOGIN && (
                        <LoginTab
                            email={email}
                            password={password}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            onSubmit={handleLoginSubmit}
                            loginError={loginError}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default AuthForm;