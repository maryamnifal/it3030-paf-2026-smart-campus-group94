import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getMyBookings, cancelBooking, updateBooking } from "../../api/bookingApi";
import { getResourceById } from "../../api/resourceApi";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import TimeSlotSelector from "../../components/TimeSlotSelector";
import { downloadBookingConfirmation, generateBookingId } from "../../utils/bookingPDF.js";

// ─── Status config — light colours like facilities page badges ────────────────
const STATUS_CONFIG = {
  PENDING:    { label: "Pending",    bg: "#fef9c3", color: "#854d0e",  border: "#fde68a" },
  APPROVED:   { label: "Approved",   bg: "#dcfce7", color: "#166534",  border: "#86efac" },
  REJECTED:   { label: "Rejected",   bg: "#fee2e2", color: "#991b1b",  border: "#fca5a5" },
  CANCELLED:  { label: "Cancelled",  bg: "#f1f5f9", color: "#475569",  border: "#cbd5e1" },
  CHECKED_IN: { label: "Checked In", bg: "#dbeafe", color: "#1e40af",  border: "#93c5fd" },
};

const card = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "20px",
  boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
};

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: "12px",
  border: "1px solid rgba(15,23,42,0.1)", background: "#fff",
  color: "#0f172a", fontSize: "14px", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: 700,
  color: "#0f172a", marginBottom: "6px",
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ booking, resource, onSave, onClose }) {
  const [form, setForm] = useState({
    date: booking.date || "",
    startTime: booking.startTime?.slice(0, 5) || "",
    endTime: booking.endTime?.slice(0, 5) || "",
    purpose: booking.purpose || "",
    expectedAttendees: booking.expectedAttendees || 1,
  });
  const [selectedSlot, setSelectedSlot] = useState({ start: booking.startTime?.slice(0, 5), end: booking.endTime?.slice(0, 5) });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSlotSelect = (s, e) => { setSelectedSlot({ start: s, end: e }); setForm(f => ({ ...f, startTime: s, endTime: e })); };

  const handleSubmit = async () => {
    setError("");
    if (!form.date || !form.startTime || !form.endTime || !form.purpose) { setError("Fill in all required fields."); return; }
    setLoading(true);
    try {
      await updateBooking(booking.id, { date: form.date, startTime: form.startTime + ":00", endTime: form.endTime + ":00", purpose: form.purpose, expectedAttendees: parseInt(form.expectedAttendees, 10) });
      onSave();
    } catch (e) { setError(e.response?.data?.message || "Failed to update"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "580px", width: "90%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Booking</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>
        {error && <div style={{ background: "#fee2e2", borderRadius: "12px", padding: "12px 16px", color: "#991b1b", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={labelStyle}>Resource</label>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{resource?.name}</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{resource?.type?.replaceAll("_", " ")} · {resource?.location} · cap. {resource?.capacity}</div>
          </div>
          <div><label style={labelStyle}>Date *</label><input type="date" value={form.date} onChange={e => { set("date", e.target.value); setSelectedSlot({ start: "", end: "" }); }} style={inputStyle} /></div>
          <TimeSlotSelector resource={resource} selectedDate={form.date} selectedSlot={selectedSlot} onSlotSelect={handleSlotSelect} />
          <div><label style={labelStyle}>Purpose *</label><input type="text" value={form.purpose} onChange={e => set("purpose", e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Expected Attendees *</label><input type="number" min="1" value={form.expectedAttendees} onChange={e => set("expectedAttendees", e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#f1f5f9", color: "#0f172a", border: "none", padding: "12px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ background: "#f4b400", color: "#111827", border: "none", padding: "12px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [booking, setBooking]   = useState(location.state?.booking || null);
  const [resource, setResource] = useState(location.state?.resource || null);
  const [loading, setLoading]   = useState(!booking);
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res    = await getMyBookings(userId);
      const found  = (res.data || []).find(b => b.id === id);
      if (found) {
        setBooking(found);
        if (found.resourceId) {
          const rRes = await getResourceById(found.resourceId);
          setResource(rRes.data);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (booking?.resourceId) {
      getResourceById(booking.resourceId).then(r => setResource(r.data)).catch(() => {});
    }
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;
    try { await cancelBooking(id); navigate("/bookings", { state: { toast: "Booking cancelled." } }); }
    catch { showToast("Failed to cancel."); }
  };

  // ── Loading / not found states — light bg ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "15px" }}>
      Loading booking...
    </div>
  );
  if (!booking) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontSize: "15px" }}>
      Booking not found.
    </div>
  );

  const readableId = generateBookingId(booking, resource?.type);
  const statusCfg  = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const canEdit    = booking.status === "PENDING" || booking.status === "APPROVED";
  const imageUrl   = resource?.imageUrl || resource?.images?.[0] || null;

  return (
    // ✅ LIGHT background — like Facilities detail page (#f8fafc)
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "80px" }}>

      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#fff", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "14px", padding: "13px 20px", color: "#0f172a", fontSize: "14px", boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }}>✓ {toast}</div>
      )}

      {editing && (
        <EditModal booking={booking} resource={resource}
          onSave={() => { setEditing(false); showToast("Booking updated!"); fetchData(); }}
          onClose={() => setEditing(false)} />
      )}

      {/* ── Header — like Facilities detail page ── */}
      <div style={{background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)", borderBottom: "1px solid rgba(15,23,42,0.07)", padding: "32px 2rem 28px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Back link */}
          <button onClick={() => navigate("/bookings")}
            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            ← Back to Bookings
          </button>

          {/* Label pill + status badge row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 700 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f4b400", display: "inline-block" }} />
              <b>BOOKING DETAILS</b>
            </div>

            {/* Download PDF */}
              {booking.status === "APPROVED" && (
                
                <button onClick={() => downloadBookingConfirmation(booking, resource?.name, resource)}
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", borderRadius: "999px", padding: "7px 20px", fontSize: "14px", fontWeight: 700 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                   ↓ Download RECEIPT
                </button>
              )}
            
          </div>

          {/* Resource name — big heading */}
          <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: "#cfcfcfce", letterSpacing: "-0.8px", marginBottom: "12px", lineHeight: 1.15 }}>
            {resource?.name || booking.resourceId}
          </h1>

          {/* Subtitle meta badges — type · ID · date */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Status badge — top right like ACTIVE badge in facilities */}
            <span style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, borderRadius: "999px", padding: "7px 20px", fontSize: "14px", fontWeight: 700 }}>
              {statusCfg.label}
            </span>
            {resource?.type && (
              <span style={{ background: "rgba(255,255,255,0.08)", color: "#f3f3f5", borderRadius: "8px", padding: "5px 12px", fontSize: "13px", fontWeight: 700 }}>
                {resource.type.replaceAll("_", " ")}
              </span>
            )}
            <span style={{ background: "rgba(255,255,255,0.08)", color: "#f3f3f5", borderRadius: "8px", padding: "5px 12px", fontSize: "13px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.8px" }}>
              🔖 {readableId}
            </span>
            
          </div>
        </div>
      </div>

      {/* ── Content grid — same structure as facilities detail ── */}
      <div style={{ maxWidth: "1000px", margin: "32px auto 0", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Resource image — full width like facilities */}
          {imageUrl && (
            <div style={{ borderRadius: "20px", overflow: "hidden", aspectRatio: "16/8" }}>
              <img src={imageUrl} alt={resource?.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => (e.target.style.display = "none")} />
            </div>
          )}

          {/* Booking details card */}
          <div style={{ ...card, padding: "28px" }}>
            <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", padding: "5px 14px", borderRadius: "999px", marginBottom: "20px" }}>
              Booking Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { label: "Requested By", value: booking.userName || booking.userId },
                { label: "Date",         value: booking.date },
                { label: "Start Time",   value: booking.startTime?.slice(0, 5) },
                { label: "End Time",     value: booking.endTime?.slice(0, 5) },
                { label: "Attendees",    value: booking.expectedAttendees },
                { label: "Purpose",      value: booking.purpose || "—" },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "5px" }}>{item.label}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Rejection reason */}
            {booking.status === "REJECTED" && booking.rejectionReason && (
              <div style={{ marginTop: "20px", background: "#fee2e2", border: "1px solid #fca5a5", borderLeft: "4px solid #dc2626", borderRadius: "12px", padding: "14px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "6px" }}>Rejection Reason</div>
                <div style={{ fontSize: "14px", color: "#991b1b", lineHeight: 1.6 }}>{booking.rejectionReason}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Resource information — like facilities right panel */}
          {resource && (
            <div style={{ ...card, padding: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Resource Information</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Type",     value: resource.type?.replaceAll("_", " ") || "—" },
                  { label: "Capacity", value: resource.capacity },
                  { label: "Location", value: resource.location || "—" },
                  { label: "Status",   value: resource.status || "—" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "5px" }}>{item.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions — like facilities "Book Now" panel */}
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "18px" }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* QR Code */}
              {booking.status === "APPROVED" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <QRCodeDisplay booking={booking} resourceName={resource?.name} />
                </div>
              )}

              

              {/* Edit */}
              {canEdit && (
                <button onClick={() => setEditing(true)}
                  style={{ background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.15)", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                  ✏️ Edit Booking
                </button>
              )}

              {/* Cancel */}
              {canEdit && (
                <button onClick={handleCancel}
                  style={{ background: "#fff", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                  ✕ Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}