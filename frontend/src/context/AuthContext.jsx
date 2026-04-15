import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Load from localStorage on refresh
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
    setUserId(localStorage.getItem("userId"));
  }, []);

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
    localStorage.clear();
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

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}