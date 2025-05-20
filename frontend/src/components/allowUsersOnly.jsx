// src/components/ProtectedRoute.jsx
import { useAuth } from "../hooks/useAuth";

export default function AllowUsersOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;

  return children;
}
