import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllResources } from "../../api/resourceApi";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBooking,
} from "../../api/bookingApi";
import TimeSlotSelector from "../../components/TimeSlotSelector";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import { downloadBookingConfirmation, generateBookingId } from "../../utils/bookingPDF";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:    { label: "Pending",    bg: "#fef9c3", color: "#854d0e"},  // light amber
  APPROVED:   { label: "Approved",   bg: "#dcfce7", color: "#166534"},  // light green
  REJECTED:   { label: "Rejected",   bg: "#fee2e2", color: "#991b1b"},  // light red
  CANCELLED:  { label: "Cancelled",  bg: "#f1f5f9", color: "#475569"},  // light grey
  CHECKED_IN: { label: "Checked In", bg: "#dbeafe", color: "#1e40af"},  // light blue
};

const pageCardStyle = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "25px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(15,23,42,0.08)",
  background: "#fff",
  color: "var(--text-dark)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "var(--text-dark)",
  marginBottom: "8px",
};

const pillStyle = {
  display: "inline-block",
  background: "var(--primary-light)",
  color: "var(--secondary)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  padding: "8px 18px",
  borderRadius: "999px",
  marginBottom: "16px",
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ BookingCard — incident card style (compact, top colour border, pill badges)
//
//   ┌─────────────────────────────┐  ← coloured top bar (matches status)
//   │ [Approved]  [LAB]  [date]   │  ← pill badges like "In Progress · MEDIUM"
//   │ 🔖 LAB#54668                │  ← booking ID like "TICKET #DBD894"
//   │ **Networking Lab 01**        │  ← bold resource name like ticket description
//   │ 📍 Block B  🕐 14:00–16:00  │  ← meta row
//   └─────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────
function BookingCard({ booking, resource, onClick }) {
  const cfg        = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const readableId = generateBookingId(booking, resource?.type);

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow   = "0 8px 28px rgba(15,23,42,0.10)";
        e.currentTarget.style.transform   = "translateY(-3px)";
        e.currentTarget.style.borderColor = cfg.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow   = "none";
        e.currentTarget.style.transform   = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
      }}
    >
      {/* ✅ TOP colour bar — exactly like incident card */}
      <div style={{ height: "4px", background: cfg.bg }} />

      <div style={{ padding: "16px 18px" }}>

        {/* Pill badges — like "In Progress · MEDIUM · CLEANING" */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "9px", flexWrap: "wrap" }}>
          <span style={{ background: cfg.bg, color: cfg.color, borderRadius: "999px", padding: "4px 11px", fontSize: "12px", fontWeight: 700 }}>
            {cfg.label}
          </span>
          {resource?.type && (
            <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: "999px", padding: "4px 11px", fontSize: "12px", fontWeight: 700 }}>
              {resource.type.replaceAll("_", " ")}
            </span>
          )}
        </div>

        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "9px", letterSpacing: "-0.1px" }}>
          {resource?.name || booking.resourceId}
        </div>

        
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.4px", marginBottom: "5px" }}>
          🔖 {readableId}
        </div>

        
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {resource?.location && (
            <span style={{ fontSize: "12px", color: "#64748b" }}>📍 {resource.location}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Booking Modal (unchanged) ──────────────────────────────────────────
function EditBookingModal({ booking, resources, onSave, onClose }) {
  const [form, setForm] = useState({ date: booking.date || "", startTime: booking.startTime?.slice(0, 5) || "", endTime: booking.endTime?.slice(0, 5) || "", purpose: booking.purpose || "", expectedAttendees: booking.expectedAttendees || 1 });
  const [selectedSlot, setSelectedSlot] = useState({ start: booking.startTime?.slice(0, 5), end: booking.endTime?.slice(0, 5) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSlotSelect = (startTime, endTime) => { setSelectedSlot({ start: startTime, end: endTime }); setForm((f) => ({ ...f, startTime, endTime })); };
  const selected = resources.find((r) => r.id === booking.resourceId);

  const handleSubmit = async () => {
    setError("");
    if (!form.date || !form.startTime || !form.endTime || !form.purpose) { setError("Please fill in all required fields."); return; }
    if (form.startTime >= form.endTime) { setError("End time must be after start time."); return; }
    setLoading(true);
    try {
      await updateBooking(booking.id, { date: form.date, startTime: form.startTime + ":00", endTime: form.endTime + ":00", purpose: form.purpose, expectedAttendees: parseInt(form.expectedAttendees, 10) });
      onSave();
    } catch (e) { setError(e.response?.data?.message || e.response?.data?.error || "Failed to update booking"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", margin: 0 }}>Edit Booking</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-light)" }}>✕</button>
        </div>
        {error && <div style={{ background: "#fee2e2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", color: "#991b1b", fontSize: "14px", marginBottom: "20px" }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Resource: {selected?.name || booking.resourceId}</label>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{selected?.type?.replaceAll("_", " ")} · {selected?.location} · cap. {selected?.capacity}</div>
          </div>
          <div><label style={labelStyle}>Date *</label><input type="date" value={form.date} onChange={(e) => { set("date", e.target.value); setSelectedSlot({ start: "", end: "" }); }} style={inputStyle} /></div>
          <div style={{ gridColumn: "1 / -1" }}><TimeSlotSelector resource={selected} selectedDate={form.date} selectedSlot={selectedSlot} onSlotSelect={handleSlotSelect} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Purpose *</label><input type="text" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} style={inputStyle} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Expected Attendees *</label><input type="number" min="1" value={form.expectedAttendees} onChange={(e) => set("expectedAttendees", e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#f3f4f6", color: "var(--text-dark)", border: "none", padding: "12px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ background: "var(--primary)", color: "#111827", border: "none", padding: "12px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [bookings, setBookings]               = useState([]);
  const [resources, setResources]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filter, setFilter]                   = useState("ALL");
  const [toast, setToast]                     = useState("");
  const [searchQuery, setSearchQuery]         = useState("");
  const [showAdvanced, setShowAdvanced]       = useState(false);
  const [editBooking, setEditBooking]         = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({ resourceId: "", dateFrom: "", dateTo: "" });

  useEffect(() => {
    if (location.state?.toast) { showToast(location.state.toast); window.history.replaceState({}, ""); }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchBookings = async () => {
    const currentUser = localStorage.getItem("userId");
    if (!currentUser) { setBookings([]); setLoading(false); return; }
    try {
      setLoading(true);
      const res = await getMyBookings(currentUser);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch { setBookings([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    getAllResources().then((res) => setResources(res.data || [])).catch(() => setResources([]));
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try { await cancelBooking(id); showToast("Booking cancelled."); fetchBookings(); }
    catch { showToast("Failed to cancel."); }
  };

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter((b) => b.status === "PENDING").length,
    APPROVED:  bookings.filter((b) => b.status === "APPROVED").length,
    REJECTED:  bookings.filter((b) => b.status === "REJECTED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
    CHECKED_IN: bookings.filter((b) => b.status === "CHECKED_IN").length,
  };

  let filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  filtered = filtered.filter((b) => {
    const resource = resources.find((r) => r.id === b.resourceId);
    const q = searchQuery.toLowerCase();
    return (
      (!searchQuery || (resource?.name || "").toLowerCase().includes(q) || (b.purpose || "").toLowerCase().includes(q)) &&
      (!advancedFilters.dateFrom || b.date >= advancedFilters.dateFrom) &&
      (!advancedFilters.dateTo   || b.date <= advancedFilters.dateTo) &&
      (!advancedFilters.resourceId || b.resourceId === advancedFilters.resourceId)
    );
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-light)", paddingBottom: "90px" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#fff", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "16px", padding: "14px 20px", color: "var(--text-dark)", fontSize: "14px", fontWeight: 500, boxShadow: "0 10px 30px rgba(15,23,42,0.1)" }}>
          ✓ {toast}
        </div>
      )}

      {/* Edit modal */}
      {editBooking && (
        <EditBookingModal
          booking={editBooking}
          resources={resources}
          onSave={() => { showToast("Booking updated successfully!"); setEditBooking(null); fetchBookings(); }}
          onClose={() => setEditBooking(null)}
        />
      )}

      {/* ── Hero — UNCHANGED from Image 2 ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)", padding: "50px 2rem 50px" }}>
        <div style={{ position: "absolute", top: "-120px", right: "-100px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 18px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "24px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            <b>BOOKINGS & RESERVATIONS</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.05, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "14px", maxWidth: "760px" }}>
                Reserve and track your campus bookings.
              </h1>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.8, maxWidth: "600px" }}>
                Book labs, halls, meeting rooms, and equipment. Track approval status and manage your reservations in one place.
              </p>
            </div>
            <button
              onClick={() => navigate("/bookings/new")}
              style={{ background: "var(--primary)", color: "#111827", border: "none", padding: "14px 26px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 24px rgba(244,180,0,0.22)", transition: "all 0.25s ease", whiteSpace: "nowrap" }}
            >
              + Book a Resource
            </button>
          </div>
        </div>
      </section>

      {/* ── Search Card — overlaps hero, UNCHANGED ── */}
      <section style={{ maxWidth: "1200px", margin: "-20px auto 30px auto", padding: "0 2rem", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "28px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", border: "1px solid rgba(15,23,42,0.06)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px" }}>Find your bookings quickly</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Search by resource name, purpose..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: "280px", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: "14px", outline: "none" }} />
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: showAdvanced ? "var(--primary)" : "#fff", color: "#111827", border: "1px solid rgba(15,23,42,0.08)", padding: "14px 18px", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              ⚙️ Advanced
            </button>
          </div>
          {showAdvanced && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" }}>
              <div>
                <label style={labelStyle}>Resource</label>
                <select value={advancedFilters.resourceId} onChange={(e) => setAdvancedFilters({ ...advancedFilters, resourceId: e.target.value })} style={inputStyle}>
                  <option value="">All Resources</option>
                  {resources.map((r) => <option key={r.id} value={r.id}>{r.name || r.id}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date From</label>
                <input type="date" value={advancedFilters.dateFrom} onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date To</label>
                <input type="date" value={advancedFilters.dateTo} onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })} style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── My Bookings Section — layout UNCHANGED, cards changed ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ ...pageCardStyle, padding: "28px" }}>

          <div style={pillStyle}>My Bookings</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.5px" }}>Your Booking History</div>
            <div style={{ fontSize: "14px", color: "var(--text-light)" }}>{loading ? "Loading..." : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""} found`}</div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Total Bookings", value: counts.ALL,      color: "#9ca3af" },
              { label: "Pending",        value: counts.PENDING,  color: "#fbbf24" },
              { label: "Approved",       value: counts.APPROVED, color: "#15803d" },
              { label: "Rejected",       value: counts.REJECTED, color: "#b30404" },
              { label: "Cancelled",      value: counts.CANCELLED,color: "#475569" },
              { label: "Checked In",     value: counts.CHECKED_IN,color: "#254fd8" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#eeeeee", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "14px", padding: "16px 20px", textAlign: "center", minWidth: "110px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, letterSpacing: "-1px" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "CHECKED_IN"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ background: filter === s ? "var(--primary)" : "#fff", color: filter === s ? "#111827" : "var(--text-light)", border: filter === s ? "none" : "1px solid rgba(15,23,42,0.08)", borderRadius: "999px", padding: "8px 18px", fontSize: "13px", fontWeight: filter === s ? 700 : 500, cursor: "pointer", boxShadow: filter === s ? "0 4px 12px rgba(244,180,0,0.2)" : "none", transition: "all 0.2s" }}>
                {s === "ALL" ? "All" : STATUS_CONFIG[s].label} ({counts[s]})
              </button>
            ))}
          </div>

          {/* ✅ Cards — incident style, 3-column grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-light)", fontSize: "16px" }}>Loading your bookings...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>📅</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "10px" }}>No bookings found</div>
              <div style={{ color: "var(--text-light)", fontSize: "14px", lineHeight: 1.7 }}>
                {filter === "ALL" ? "Click '+ Book a Resource' above to make your first booking." : `No ${filter.toLowerCase()} bookings to show.`}
              </div>
            </div>
          ) : (
            // ✅ Same 3-col grid as incident cards
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))", gap: "16px" }}>
              {filtered.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  resource={resources.find((r) => r.id === b.resourceId)}
                  onClick={() => navigate(`/bookings/${b.id}`, { state: { booking: b, resource: resources.find((r) => r.id === b.resourceId) } })}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}