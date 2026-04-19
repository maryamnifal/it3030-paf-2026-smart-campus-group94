import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [name, setName] = useState(() => localStorage.getItem("name"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  const login = (token, role, name, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name || "");
    localStorage.setItem("userId", userId);

    setToken(token);
    setRole(role);
    setName(name || "");
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");

    setToken(null);
    setRole(null);
    setName(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, name, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}