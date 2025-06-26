// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface Props {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: Props) => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = !!currentUser;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
