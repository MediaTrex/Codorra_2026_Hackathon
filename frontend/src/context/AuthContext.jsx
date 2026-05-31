import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../Services/apiClient";
import { api } from "../Services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.me();
      if (res?.data?.success) {
        setUser(res.data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res?.data?.success) {
      // Store token
      if (res.data.access_token) {
        sessionStorage.setItem("cg_token", res.data.access_token);
      }
      setUser(res.data.user || null);
      return res.data;
    }
    throw new Error(res?.data?.message || "Login failed");
  };

  const signup = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res?.data?.success) {
      if (res.data.access_token) {
        sessionStorage.setItem("cg_token", res.data.access_token);
      }
      setUser(res.data.user || null);
      return res.data;
    }
    throw new Error(res?.data?.message || "Signup failed");
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    } finally {
      sessionStorage.removeItem("cg_token");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, isLoggedIn: !!user, login, signup, logout, refresh: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}