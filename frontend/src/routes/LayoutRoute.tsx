// src/routes/LayoutRoute.tsx
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppLayout } from "@/components/layouts/AppLayout";
import { RootState } from "@/app/store";

const LayoutRoute = ({ element }: { element: JSX.Element }) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  if (!currentUser) return <Navigate to="/" />;

  return <AppLayout>{element}</AppLayout>;
};

export default LayoutRoute;
