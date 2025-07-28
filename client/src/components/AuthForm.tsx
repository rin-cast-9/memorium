import { AuthTabs } from "@/utils/AuthTabs";
import { useState } from "react";
import AuthTabsComponent from "./AuthTabsComponent";
import SignupTab from "./SignupTab";
import LoginTab from "./LoginTab";

type AuthFormProps = {
    email: string;
    password: string;
    fullName: string;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
    setFullName: (v: string) => void;
    onSignupSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    onLoginSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    fullNameError?: string | null;
    emailError?: string | null;
    loginError?: string | null;
};

const AuthForm = ({
    email,
    password,
    fullName,
    setEmail,
    setPassword,
    setFullName,
    onSignupSubmit,
    onLoginSubmit,
    fullNameError,
    emailError,
    loginError,
}: AuthFormProps) => {
    const [activeTab, setActiveTab] = useState(AuthTabs.SIGNUP);

    return (
        <div className="bg-[var(--color-black-4)] flex flex-col min-h-screen">
            <main className="flex flex-1 justify-center">
                <div className="bg-[var(--color-black-4)] w-[580px] pt-[73px]">
                    <div className="text-[var(--color-white)] font-h1 text-center">
                        Welcome to Memorium!
                    </div>

                    <AuthTabsComponent
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {activeTab === AuthTabs.SIGNUP && (
                        <SignupTab
                            email={email}
                            password={password}
                            fullName={fullName}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            setFullName={setFullName}
                            onSubmit={onSignupSubmit}
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
                            onSubmit={onLoginSubmit}
                            loginError={loginError}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};

export default AuthForm;