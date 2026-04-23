import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { name, role, userId } = useAuth();

  const displayName = name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "3rem 1.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {initial}
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {displayName}
            </h2>

            <div
              style={{
                marginTop: "8px",
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(15, 23, 42, 0.08)",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
                display: "inline-block",
                letterSpacing: "0.3px",
              }}
            >
              {role}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              margin: "0 0 0.5rem",
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Profile Information
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            View your basic account details and role information here.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
          }}
        >
          <InfoRow label="Full Name" value={displayName} />
          <InfoRow label="Role" value={role} />
          <InfoRow label="User ID" value={userId} mono />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "16px",
        padding: "1rem 1.1rem",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#64748b",
          marginBottom: "0.45rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#0f172a",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}