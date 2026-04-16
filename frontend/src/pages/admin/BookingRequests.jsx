import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  deleteBooking,
} from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e" },
  APPROVED:  { label: "Approved",  bg: "#dcfce7", color: "#166534" },
  REJECTED:  { label: "Rejected",  bg: "#fee2e2", color: "#991b1b" },
  CANCELLED: { label: "Cancelled", bg: "#f1f5f9", color: "#475569" },
};

const pageCardStyle = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(15,23,42,0.07)",
  borderRadius: "28px",
  boxShadow: "0 20px 45px rgba(15,23,42,0.07)",
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

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: "999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

// ─── Reject Modal with reason input ──────────────────────────────────────────
function RejectModal({ booking, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(9,18,32,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "28px", boxShadow: "0 20px 60px rgba(15,23,42,0.15)", padding: "32px", width: "480px", maxWidth: "100%" }}>
        <div style={pillStyle}>Admin Action</div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "6px", letterSpacing: "-0.4px" }}>
          Reject Booking
        </div>
        <p style={{ color: "var(--text-light)", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
          Provide a reason for rejecting this booking. This will be shown to the user.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Room is under maintenance, Conflicting scheduled event..."
          rows={4}
          style={{ ...inputStyle, resize: "vertical", minHeight: "110px" }}
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#fff", color: "var(--text-dark)", border: "1px solid rgba(15,23,42,0.08)", padding: "12px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.color = "var(--secondary)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(15,23,42,0.08)"; e.target.style.color = "var(--text-dark)"; }}>
            Cancel
          </button>
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason); }}
            disabled={!reason.trim()}
            style={{ background: reason.trim() ? "#dc2626" : "rgba(15,23,42,0.08)", color: reason.trim() ? "#fff" : "var(--text-muted)", border: "none", padding: "12px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: reason.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single booking row ───────────────────────────────────────────────────────
function BookingRow({ booking, resources, onApprove, onReject, onDelete }) {
  const resource = resources.find(r => r.id === booking.resourceId);
  const isPending = booking.status === "PENDING";

  return (
    <div style={{ ...pageCardStyle, padding: "24px 28px", transition: "all 0.25s ease" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 50px rgba(15,23,42,0.10)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 45px rgba(15,23,42,0.07)"; e.currentTarget.style.borderColor = "rgba(15,23,42,0.07)"; }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          {/* Resource */}
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            {resource?.type?.replaceAll("_", " ") || "RESOURCE"}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.3px", marginBottom: "6px" }}>
            {resource?.name || booking.resourceId}
          </div>
          {resource?.location && (
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>📍 {resource.location}</div>
          )}

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
            {[
              { label: "Requested by", value: booking.userName || booking.userId },
              { label: "Date",         value: booking.date },
              { label: "Time",         value: `${booking.startTime?.slice(0,5)} – ${booking.endTime?.slice(0,5)}` },
              { label: "Attendees",    value: booking.expectedAttendees },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{item.label}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-dark)" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {booking.purpose && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>Purpose</div>
              <div style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.6 }}>{booking.purpose}</div>
            </div>
          )}

          {booking.status === "REJECTED" && booking.rejectionReason && (
            <div style={{ marginTop: "12px", background: "#fee2e2", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "14px", padding: "10px 14px", fontSize: "13px", color: "#991b1b", lineHeight: 1.6 }}>
              <strong>Rejection reason:</strong> {booking.rejectionReason}
            </div>
          )}
        </div>

        {/* Status badge */}
        <StatusBadge status={booking.status} />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid rgba(15,23,42,0.06)" }}>
        {isPending && (
          <>
            <button
              onClick={() => onApprove(booking.id)}
              style={{ background: "#16a34a", color: "#fff", border: "none", padding: "11px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 22px rgba(22,163,74,0.20)", transition: "all 0.2s" }}
              onMouseEnter={e => e.target.style.background = "#15803d"}
              onMouseLeave={e => e.target.style.background = "#16a34a"}>
              ✓ Approve
            </button>
            <button
              onClick={() => onReject(booking)}
              style={{ background: "#dc2626", color: "#fff", border: "none", padding: "11px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 22px rgba(220,38,38,0.20)", transition: "all 0.2s" }}
              onMouseEnter={e => e.target.style.background = "#b91c1c"}
              onMouseLeave={e => e.target.style.background = "#dc2626"}>
              ✕ Reject
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(booking.id)}
          style={{ background: "#fff", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)", padding: "11px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", marginLeft: isPending ? "auto" : "0" }}
          onMouseEnter={e => e.target.style.background = "#fee2e2"}
          onMouseLeave={e => e.target.style.background = "#fff"}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Bookings Page ─────────────────────────────────────────────────
export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        getAllBookings(),
        getAllResources(),
      ]);
      setBookings(bookingsRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Failed to load bookings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      showToast("Booking approved successfully.");
      fetchData();
    } catch (err) {
      showToast("Failed to approve booking.", "error");
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectBooking(rejectTarget.id, reason);
      showToast("Booking rejected.");
      setRejectTarget(null);
      fetchData();
    } catch (err) {
      showToast("Failed to reject booking.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this booking?")) return;
    try {
      await deleteBooking(id);
      showToast("Booking deleted.");
      fetchData();
    } catch (err) {
      showToast("Failed to delete booking.", "error");
    }
  };

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter(b => b.status === "PENDING").length,
    APPROVED:  bookings.filter(b => b.status === "APPROVED").length,
    REJECTED:  bookings.filter(b => b.status === "REJECTED").length,
    CANCELLED: bookings.filter(b => b.status === "CANCELLED").length,
  };

  const filtered = bookings
    .filter(b => statusFilter === "ALL" || b.status === statusFilter)
    .filter(b =>
      search === "" ||
      b.userId?.toLowerCase().includes(search.toLowerCase()) ||
      b.resourceId?.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(search.toLowerCase())
    );

  const containerStyle = { maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(244,180,0,0.06), transparent 18%), linear-gradient(180deg, #f8fafc 0%, #f8fafc 55%, #eef2f7 100%)", paddingBottom: "80px" }}>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#fff", border: `1px solid ${toast.type === "error" ? "rgba(220,38,38,0.3)" : "rgba(15,23,42,0.08)"}`, borderRadius: "16px", padding: "14px 20px", color: toast.type === "error" ? "#991b1b" : "var(--text-dark)", fontSize: "14px", fontWeight: 500, boxShadow: "0 10px 30px rgba(15,23,42,0.1)" }}>
          {toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* Hero Banner */}
      <section style={{ position: "relative", overflow: "hidden", background: "radial-gradient(circle at top right, rgba(244,180,0,0.16), transparent 25%), linear-gradient(120deg, rgba(9,18,32,0.98) 0%, rgba(15,41,71,0.94) 48%, rgba(22,58,99,0.88) 100%)", padding: "132px 0 94px" }}>
        <div style={{ position: "absolute", top: "-110px", right: "-50px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(244,180,0,0.10)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-110px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(80px)" }} />

        <div style={{ ...containerStyle, position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "9px 18px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.92)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.7px", marginBottom: "24px", textTransform: "uppercase" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            Admin Panel
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", lineHeight: 1.02, fontWeight: 900, color: "#fff", letterSpacing: "-1.7px", marginBottom: "18px", maxWidth: "780px" }}>
            Booking Requests
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "16px", lineHeight: 1.9, maxWidth: "700px" }}>
            Review, approve, or reject user booking requests from one place.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "16px", marginTop: "36px", flexWrap: "wrap" }}>
            {[{ label: "Total", value: counts.ALL }, { label: "Pending", value: counts.PENDING }, { label: "Approved", value: counts.APPROVED }, { label: "Rejected", value: counts.REJECTED }].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", padding: "16px 22px", minWidth: "100px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "3px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ ...containerStyle, marginTop: "-42px", position: "relative", zIndex: 3 }}>

        {/* Search + Filter */}
        <div style={{ ...pageCardStyle, padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search by user, resource, or purpose..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: "380px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? "var(--primary)" : "#fff", color: statusFilter === s ? "#111827" : "var(--text-dark)", border: statusFilter === s ? "none" : "1px solid rgba(15,23,42,0.08)", padding: "9px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: statusFilter === s ? "0 8px 20px rgba(244,180,0,0.18)" : "none", transition: "all 0.2s ease" }}>
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Count label */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.5px" }}>All Bookings</div>
          <div style={{ fontSize: "14px", color: "var(--text-light)", marginTop: "4px" }}>
            {loading ? "Loading bookings..." : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""} found`}
          </div>
        </div>

        {/* Booking list */}
        {loading ? (
          <div style={{ ...pageCardStyle, padding: "60px", textAlign: "center", color: "var(--text-light)", fontSize: "16px", fontWeight: 600 }}>
            Loading booking requests...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...pageCardStyle, padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "42px", marginBottom: "14px" }}>📋</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "8px" }}>No bookings found</div>
            <div style={{ color: "var(--text-light)", fontSize: "14px" }}>Try adjusting your search or filter.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filtered.map(b => (
              <BookingRow
                key={b.id}
                booking={b}
                resources={resources}
                onApprove={handleApprove}
                onReject={setRejectTarget}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}