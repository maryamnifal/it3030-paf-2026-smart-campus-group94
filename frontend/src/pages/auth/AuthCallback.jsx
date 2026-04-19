import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    const name = params.get("name");
    const userId = params.get("userId");

    console.log("AuthCallback loaded");
    console.log("URL:", window.location.href);
    console.log("DATA:", { token, role, name, userId });

    if (token && role) {
      login(token, role, name, userId);

      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, login]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "4px solid #EDE9FE",
          borderTop: "4px solid #6D28D9",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#6D28D9", fontWeight: 500 }}>
        Signing you in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}