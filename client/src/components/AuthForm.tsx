"use client";

import { AuthTabs } from "@/utils/AuthTabs";
import { useState } from "react";
import AuthTabsComponent from "./AuthTabsComponent";
import SignupTab from "./SignupTab";
import LoginTab from "./LoginTab";
import { useTranslations } from "next-intl";
import { ERROR_CODES } from "@/utils/api";
import { loginApi, registerApi } from "@/utils/auth.api";
import { useRouter } from "next/navigation";

const AuthForm = () => {
    const t = useTranslations();
    const router = useRouter();

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

        const { error } = await registerApi(email, fullname, password);

        if (error) {
            switch (error.message) {
                case ERROR_CODES.FULL_NAME_EMPTY:
                case ERROR_CODES.FULL_NAME_TOO_SHORT:
                case ERROR_CODES.FULL_NAME_TOO_LONG:
                case ERROR_CODES.FULL_NAME_INVALID_CHARACTERS:
                    setFullNameError(t(`errors.${error.message}`));
                    break;

                case ERROR_CODES.USER_EXISTS:
                    setEmailError(t(`errors.${error.message}`));
                    break;

                default:
                    router.replace("/error");
            }
            return;
        }

        await login(email, password);
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await login(email, password);
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await loginApi(email, password);

        if (error) {
            setLoginError(t(`errors.${error.message}`));
            return;
        }

        localStorage.setItem("username", data?.username ?? "");

        router.replace("/library");
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