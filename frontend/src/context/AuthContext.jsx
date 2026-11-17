import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("itax_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("itax_user")); } catch { return null; }
  });

  const login = useCallback((t, u) => {
    setToken(t); setUser(u);
    localStorage.setItem("itax_token", t);
    localStorage.setItem("itax_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null); setUser(null);
    localStorage.removeItem("itax_token");
    localStorage.removeItem("itax_user");
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
