"use client";

import AuthForm from "@/components/AuthForm";
import { apiUrl } from "@/utils/constants";
import { useState } from "react";

const RegisterPage = () => {
    const [message, setMessage] = useState("");
    const [currentDB, setCurrentDB] = useState("");

    const fetchPing = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${apiUrl}/ping`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            setMessage(data.message);
            setCurrentDB(data.database || "");
        }
        catch (error) {
            setMessage("Error fetching data");
            setCurrentDB("🖕");
        }
    };

    return (
        <>
            <div style={{ padding: 20 }}>
                <button onClick={fetchPing}>Send Ping</button>
                <div>
                    <strong>Message:</strong> {message}
                </div>
                <div>
                    <strong>Current DB:</strong> {currentDB}
                </div>
            </div>
        </>
    );
};

export default RegisterPage;