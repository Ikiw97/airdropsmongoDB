import { useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const HEARTBEAT_INTERVAL = 2 * 60 * 1000; // 2 minutes

const UserActivityTracker = ({ isLoggedIn }) => {
    useEffect(() => {
        if (!isLoggedIn) return;

        const sendHeartbeat = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                await axios.post(
                    `${API_URL}/api/auth/heartbeat`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Heartbeat failed", error);
            }
        };

        // Send immediately on mount/login
        sendHeartbeat();

        // Set up interval
        const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        // Activity listeners to update status on user interaction
        // (Optional: We could debounce this to only send if also > 5 min, but simple interval is robust enough for now)

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    return null; // This component handles logic only, no UI
};

export default UserActivityTracker;
