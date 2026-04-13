export default function UserDashboard() {
  const name = localStorage.getItem("name");
  return (
    <div style={{ padding: "120px 2rem", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "#6D28D9" }}>
        Welcome, {name}! 👋
      </h1>
      <p style={{ color: "#64748B", marginTop: "12px" }}>You are logged in as USER</p>
    </div>
  );
}