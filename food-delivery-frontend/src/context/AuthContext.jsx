import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const data = res.data.data;
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: data.userId,
        username: data.username,
        email: data.email,
      }),
    );
    setToken(data.accessToken);
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
    });
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, register, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
