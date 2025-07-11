import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useIdleLogout } from "@/hooks/useSessionTimeout";

interface Props {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: Props) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const currentUserId = currentUser ? currentUser.id : "";
  const isClockedIn = useSelector(
    (state: RootState) =>
      state.clockSummary.summaryByUser?.[currentUserId]?.clockedIn ?? null
  );

  const isAuthenticated = !!currentUser;

  useIdleLogout(30 * 1000);

  return isAuthenticated && isClockedIn ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRoute;
