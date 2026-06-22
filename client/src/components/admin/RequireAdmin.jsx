import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../services/adminApi';

/** Gate admin routes — redirect to the login screen when no token is stored. */
const RequireAdmin = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  return children;
};

export default RequireAdmin;
