import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useIdleLogout } from "@/hooks/useSessionTimeout"; // optional here

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const currentUserId = currentUser ? currentUser.id : "";
  const isClockedIn = useSelector(
    (state: RootState) => state.clock.usersClockData[currentUserId]?.isClockedIn
  );

  const isAuthenticated = !!currentUser;

  useIdleLogout(30 * 1000);

  return isAuthenticated && isClockedIn ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

export default PublicRoute;
