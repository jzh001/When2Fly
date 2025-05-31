// src/components/ProtectedRoute.jsx
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { message, App } from 'antd';
export default function AllowUsersOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) {
    message.error('You must be logged in to access this page');
    return (
      <Navigate to={'/'} replace/>
    );
  }

  return children;
}
