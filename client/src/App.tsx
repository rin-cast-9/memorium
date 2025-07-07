import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

const App = () => {
    const [message, setMessage] = useState("");
    const [currentDB, setCurrentDB] = useState("");

    const fetchPing = async () => {
        try {
            const res = await fetch(`${API}/ping`);
            console.log(`${API}`);
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

export default App;