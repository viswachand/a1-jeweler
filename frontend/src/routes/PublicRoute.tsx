// src/routes/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = !!currentUser;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default PublicRoute;
