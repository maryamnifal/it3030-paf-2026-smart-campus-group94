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
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.851 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
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

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.022 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.021 1.792-4.688 4.533-4.688 1.313 0 2.686.236 2.686.236v2.965H15.83c-1.491 0-1.956.931-1.956 1.887v2.26h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.099 24 12.073z"
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
            href="http://localhost:8080/oauth2/authorization/facebook"
            style={{ textDecoration: "none" }}
          >
            <button
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(24,119,242,0.32)";
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
              <FacebookIcon />
              Continue with Facebook
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