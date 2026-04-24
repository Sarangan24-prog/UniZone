import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthed = !!user;

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (error) {
      console.error("AuthContext login error:", error);
      throw error;
    }
  };

  const register = async ({ name, email, password, role = "student", roleCreateKey = "" }) => {
    try {
      const res = await api.post("/auth/register", { name, email, password, role, roleCreateKey });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (error) {
      console.error("AuthContext register error:", error);
      throw error; // Re-throw to let component handle it
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const value = useMemo(() => ({ user, isAuthed, login, register, logout, updateUser }), [user, isAuthed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
