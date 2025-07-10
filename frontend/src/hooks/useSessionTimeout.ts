import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as currentUserLogout } from "@/features/auth/currentUser";
import type { AppDispatch, RootState } from "@/app/store";

export const useIdleLogout = (idleTimeoutMs: number) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.currentUser);

    useEffect(() => {
        if (!currentUser) return;

        let lastActivity = Date.now();
        console.log("[IdleLogout] Timer started. Will logout after", idleTimeoutMs, "ms of inactivity");

        const resetTimer = () => {
            lastActivity = Date.now();
        };

        const checkIdle = () => {
            const now = Date.now();
            if (now - lastActivity > idleTimeoutMs) {
                console.log("[IdleLogout] User inactive. Logging out...");
                dispatch(currentUserLogout());
                localStorage.removeItem("persist:user");
                navigate("/");
            }
        };

        const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart"];
        activityEvents.forEach((event) => document.addEventListener(event, resetTimer));

        const interval = setInterval(checkIdle, 1000); // Check every second

        return () => {
            clearInterval(interval);
            activityEvents.forEach((event) => document.removeEventListener(event, resetTimer));
        };
    }, [dispatch, navigate, idleTimeoutMs, currentUser]);
};
