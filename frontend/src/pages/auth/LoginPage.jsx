import { useNavigate } from "react-router-dom";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.244 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.851 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.851 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4.337 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.153 35.091 26.715 36 24 36c-5.223 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C36.971 38.47 44 33 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#111827"
        d="M12 .5C5.649.5.5 5.649.5 12a11.5 11.5 0 0 0 7.86 10.915c.575.106.785-.25.785-.556 0-.274-.01-1-.016-1.962-3.197.695-3.872-1.54-3.872-1.54-.523-1.328-1.277-1.682-1.277-1.682-1.044-.714.079-.7.079-.7 1.154.081 1.761 1.185 1.761 1.185 1.026 1.759 2.692 1.251 3.348.957.104-.743.402-1.251.731-1.539-2.552-.29-5.236-1.276-5.236-5.682 0-1.255.448-2.281 1.183-3.085-.119-.29-.513-1.458.112-3.04 0 0 .965-.309 3.162 1.178A10.97 10.97 0 0 1 12 6.04c.974.005 1.956.132 2.873.387 2.195-1.487 3.159-1.178 3.159-1.178.627 1.582.233 2.75.115 3.04.737.804 1.181 1.83 1.181 3.085 0 4.417-2.688 5.389-5.248 5.673.413.356.781 1.058.781 2.134 0 1.541-.014 2.783-.014 3.162 0 .309.207.668.79.555A11.503 11.503 0 0 0 23.5 12C23.5 5.649 18.351.5 12 .5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const shellStyle = {
    minHeight: "calc(100vh - 74px)",
    background:
      "radial-gradient(circle at top, rgba(244,180,0,0.06), transparent 18%), linear-gradient(180deg, #f8fafc 0%, #f8fafc 55%, #eef2f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 16px 48px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(15,23,42,0.07)",
    borderRadius: "32px",
    boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
    padding: "24px",
  };

  const socialButtonStyle = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#fff",
    color: "#0f172a",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    transition: "all 0.22s ease",
    boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
  };

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 16px",
            borderRadius: "999px",
            background: "rgba(244,180,0,0.12)",
            color: "#0f172a",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.7px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--primary)",
              display: "inline-block",
            }}
          />
          SIGN IN
        </div>

        <h1
          style={{
            fontSize: "42px",
            lineHeight: 1.05,
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-1.2px",
            marginBottom: "14px",
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "17px",
            lineHeight: 1.8,
            marginBottom: "30px",
            maxWidth: "420px",
          }}
        >
          Choose your preferred sign-in method to continue to UniSphere.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <a
            href="http://localhost:8080/oauth2/authorization/google"
            style={{ textDecoration: "none" }}
          >
            <button
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(244,180,0,0.45)";
                e.currentTarget.style.boxShadow =
                  "0 14px 28px rgba(15,23,42,0.06)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(15,23,42,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </a>

          <a
            href="http://localhost:8080/oauth2/authorization/github"
            style={{ textDecoration: "none" }}
          >
            <button
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(17,24,39,0.22)";
                e.currentTarget.style.boxShadow =
                  "0 14px 28px rgba(15,23,42,0.06)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(15,23,42,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </a>
        </div>

        <div
          style={{
            height: "1px",
            background: "rgba(15,23,42,0.07)",
            margin: "28px 0 20px",
          }}
        />

        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            color: "#475569",
            border: "none",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569";
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}