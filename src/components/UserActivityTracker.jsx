import { useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds

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
                // console.error("Heartbeat failed", error);
            }
        };

        // Send immediately on mount/login
        sendHeartbeat();

        // Set up interval
        const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        // Send heartbeat when user comes back to tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sendHeartbeat();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLoggedIn]);

    return null; // This component handles logic only, no UI
};

export default UserActivityTracker;
