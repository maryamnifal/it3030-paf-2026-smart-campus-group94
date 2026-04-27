import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllResources } from "../../api/resourceApi";
import { createBooking } from "../../api/bookingApi";
import TimeSlotSelector from "../../components/TimeSlotSelector";

// ─── Styles ───────────────────────────────────────────────────────────────────
const card = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
  padding: "28px 32px",
};

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(15,23,42,0.12)",
  background: "#fff",
  color: "#0f172a",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "7px",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateBookingPage() {
  const navigate = useNavigate();

  const [resources, setResources]           = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [form, setForm]                     = useState({ resourceId: "", date: "", startTime: "", endTime: "", purpose: "", expectedAttendees: 1 });
  const [selectedSlot, setSelectedSlot]     = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSlotSelect = (startTime, endTime) => {
    setSelectedSlot({ start: startTime, end: endTime });
    setForm((prev) => ({ ...prev, startTime, endTime }));
  };

  useEffect(() => {
    getAllResources({ status: "ACTIVE" })
      .then((res) => setResources(res.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoadingResources(false));
  }, []);

  const selected = resources.find((r) => r.id === form.resourceId);

  const handleSubmit = async () => {
    const currentUser     = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("name");
    setError("");

    if (!form.resourceId || !form.date || !form.startTime || !form.endTime || !form.purpose) {
      setError("Please fill in all required fields."); return;
    }
    if (form.startTime >= form.endTime) { setError("End time must be after start time."); return; }
    if (!currentUser) { setError("User session not found. Please log in again."); return; }

    setLoading(true);
    try {
      await createBooking({
        ...form,
        userId:             currentUser,
        userName:           currentUserName || currentUser,
        startTime:          form.startTime + ":00",
        endTime:            form.endTime + ":00",
        expectedAttendees:  parseInt(form.expectedAttendees, 10),
      });
      // Go back to bookings list after success
      navigate("/bookings", { state: { toast: "Booking submitted! Awaiting admin approval." } });
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", paddingBottom: "80px" }}>

      {/* ── Hero — like Add Facility page ── */}
      <section style={{ background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)", padding: "80px 2rem 50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-100px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Back link */}
          <button
            onClick={() => navigate("/bookings")}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Back to My Bookings
          </button>

          {/* Label pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600, marginBottom: "16px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary, #f4b400)", display: "inline-block" }} />
            <b>NEW BOOKING REQUEST</b>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: "10px" }}>
            Book a New Campus Resource
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", lineHeight: 1.7, maxWidth: "400px" }}>
            Fill in the details below to submit your booking request. It will be reviewed and approved by an admin.
          </p>
        </div>
      </section>

      {/* ── Form + Summary grid ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 2rem 0", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "28px", alignItems: "start" }}>

        {/* ── LEFT: Booking form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={card}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "22px" }}>Booking Details</div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "13px 16px", color: "#991b1b", fontSize: "14px", marginBottom: "20px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Resource */}
              <div>
                <label style={labelStyle}>Resource *</label>
                <select
                  value={form.resourceId}
                  onChange={(e) => set("resourceId", e.target.value)}
                  style={inputStyle}
                  disabled={loadingResources}
                  onFocus={(e)  => (e.target.style.borderColor = "#f4b400")}
                  onBlur={(e)   => (e.target.style.borderColor = "rgba(15,23,42,0.12)")}
                >
                  <option value="">{loadingResources ? "Loading resources..." : "Select a resource..."}</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} — {r.type?.replaceAll("_", " ")} (cap. {r.capacity})</option>
                  ))}
                </select>
                {!loadingResources && resources.length === 0 && (
                  <span style={{ fontSize: "12px", color: "#991b1b", marginTop: "6px", display: "block" }}>No active resources found.</span>
                )}
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => { set("date", e.target.value); setSelectedSlot(null); }}
                  min={new Date().toISOString().split("T")[0]}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#f4b400")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(15,23,42,0.12)")}
                />
              </div>

              {/* Time slot */}
              <div>
                <TimeSlotSelector
                  resource={selected}
                  selectedDate={form.date}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                />
              </div>

              {/* Purpose */}
              <div>
                <label style={labelStyle}>Purpose *</label>
                <input
                  type="text"
                  placeholder="e.g. Team meeting, Workshop, Lecture..."
                  value={form.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#f4b400")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(15,23,42,0.12)")}
                />
              </div>

              {/* Attendees */}
              <div>
                <label style={labelStyle}>Expected Attendees *</label>
                <input
                  type="number"
                  min={1}
                  max={selected?.capacity || 9999}
                  value={form.expectedAttendees}
                  onChange={(e) => set("expectedAttendees", e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#f4b400")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(15,23,42,0.12)")}
                />
                {selected?.capacity && (
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "5px", display: "block" }}>
                    Max capacity for this resource: {selected.capacity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Preview + Tips + Submit ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Booking summary preview */}
          <div style={card}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>Quick Preview</div>

            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "18px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px" }}>Resource Name</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                {selected?.name || "Untitled Resource"}
              </div>
              {selected && (
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                  {selected.type?.replaceAll("_", " ")} · {selected.location} · cap. {selected.capacity}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Date",       value: form.date || "—" },
                  { label: "Attendees",  value: form.expectedAttendees },
                  { label: "Start",      value: form.startTime || "—" },
                  { label: "End",        value: form.endTime || "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {form.purpose && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px" }}>Purpose</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{form.purpose}</div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div style={card}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Tips</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Bookings require admin approval before confirmation.",
                "Only ACTIVE resources are shown in the dropdown.",
                "You can cancel a pending or approved booking anytime.",
                "Rejected bookings will show a reason from the admin.",
                "Approved bookings include a QR code for check-in.",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--primary, #f4b400)", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px" }}>✓</div>
                  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{tip}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit / Cancel buttons */}
          <div style={{ ...card, padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleSubmit}
                disabled={loading || loadingResources}
                style={{ background: "var(--primary, #f4b400)", color: "#111827", border: "none", padding: "14px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 10px 24px rgba(244,180,0,0.22)", opacity: loading ? 0.7 : 1, fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? "Submitting..." : "Submit Booking Request"}
              </button>
              <button
                onClick={() => navigate("/bookings")}
                style={{ background: "#fff", color: "#64748b", border: "1px solid rgba(15,23,42,0.12)", padding: "14px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,0.12)"; e.currentTarget.style.color = "#64748b"; }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}