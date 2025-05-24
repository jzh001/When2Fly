// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:3000/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data); // contains name, email, etc.;
    } catch (err) {
      console.error("Token invalid:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  console.log(user);
  return { user, loading, isAuthenticated: !!user };
}
