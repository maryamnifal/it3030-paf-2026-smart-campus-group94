import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    const name = params.get("name");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "16px",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        border: "4px solid #EDE9FE",
        borderTop: "4px solid #6D28D9",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#6D28D9", fontWeight: 500 }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}