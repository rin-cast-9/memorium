"use client";

import AuthForm from "@/components/AuthForm";
import { apiUrl } from "@/utils/constants";
import { useState } from "react";

const AuthPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleSingupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFullNameError(null);
        setEmailError(null);

        const response = await fetch(`${apiUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName, password }),
        });

        const message = await response.text();

        if (response.ok) {
            await login(email, password);
        }
        else {
            if (message.includes("full name")) {
                setFullNameError(message);
            }
            else if (message.includes("user already exists")) {
                setEmailError("Email already in use");
            }
            else {
                alert("Unknown error: " + message);
            }
        }
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

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "/ping";
            return true;
        }
        else {
            setLoginError("Invalid email or password");
            return false;
        }
    };

    return (
        <AuthForm
            email={email}
            password={password}
            fullName={fullName}
            setEmail={setEmail}
            setPassword={setPassword}
            setFullName={setFullName}
            onSignupSubmit={handleSingupSubmit}
            onLoginSubmit={handleLoginSubmit}
            fullNameError={fullNameError}
            emailError={emailError}
            loginError={loginError}
        />
    );
};

export default AuthPage;