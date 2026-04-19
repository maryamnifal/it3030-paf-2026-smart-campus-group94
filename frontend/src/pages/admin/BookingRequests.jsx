import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for Check-In Scanner nav
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  deleteBooking,
} from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";
import { downloadBookingSummaryReport } from "../../utils/bookingPDF";

const card = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
};

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e" },
  APPROVED:  { label: "Approved",  bg: "#dcfce7", color: "#166534" },
  REJECTED:  { label: "Rejected",  bg: "#fee2e2", color: "#991b1b" },
  CANCELLED: { label: "Cancelled", bg: "#f1f5f9", color: "#475569" },
  CHECKED_IN: { label: "Checked In", bg: "#dbeafe", color: "#1e40af" },
};

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: "999px", padding: size === "lg" ? "8px 18px" : "5px 12px", fontSize: size === "lg" ? "13px" : "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

function RejectModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(9,18,32,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ ...card, padding: "32px", width: "460px", maxWidth: "100%" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Reject Booking</div>
        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.7, marginBottom: "18px" }}>Provide a reason — this will be shown to the user.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Room under maintenance..." rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(15,23,42,0.1)", fontSize: "14px", outline: "none", resize: "vertical", minHeight: "100px", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: "10px", marginTop: "18px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#fff", color: "#64748b", border: "1px solid rgba(15,23,42,0.1)", padding: "10px 20px", borderRadius: "999px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason)} disabled={!reason.trim()} style={{ background: reason.trim() ? "#dc2626" : "#f1f5f9", color: reason.trim() ? "#fff" : "#94a3b8", border: "none", padding: "10px 20px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: reason.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, resource, onClick }) {
  return (
    <div onClick={onClick} style={{ ...card, padding: "20px 24px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,23,42,0.09)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,0.05)"; }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "3px" }}>{resource?.type?.replaceAll("_", " ") || "Resource"}</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resource?.name || booking.resourceId}</div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>👤 {booking.userName || booking.userId}</span>
          <span style={{ fontSize: "13px", color: "#64748b" }}>📅 {booking.date}</span>
          <span style={{ fontSize: "13px", color: "#64748b" }}>🕐 {booking.startTime?.slice(0,5)} – {booking.endTime?.slice(0,5)}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <StatusBadge status={booking.status} />
        <span style={{ color: "#94a3b8", fontSize: "18px" }}>›</span>
      </div>
    </div>
  );
}

function BookingDetail({ booking, resource, onBack, onApprove, onReject, onDelete }) {
  const isPending = booking.status === "PENDING";
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", padding: 0, fontFamily: "inherit" }}>
        ← Back to all bookings
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ ...card, padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" }}>{resource?.type?.replaceAll("_", " ") || "Resource"}</div>
              <StatusBadge status={booking.status} size="lg" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: "6px" }}>{resource?.name || booking.resourceId}</div>
            {resource?.location && <div style={{ fontSize: "14px", color: "#64748b" }}>📍 {resource.location}</div>}
          </div>
          <div style={{ ...card, padding: "28px 32px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>Booking Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[{ label: "Requested By", value: booking.userName || booking.userId }, { label: "Date", value: booking.date }, { label: "Start Time", value: booking.startTime?.slice(0,5) }, { label: "End Time", value: booking.endTime?.slice(0,5) }, { label: "Attendees", value: booking.expectedAttendees }, { label: "Purpose", value: booking.purpose || "—" }].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "5px" }}>{item.label}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          {booking.status === "REJECTED" && booking.rejectionReason && (
            <div style={{ ...card, padding: "20px 24px", borderLeft: "4px solid #dc2626", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "6px" }}>Rejection Reason</div>
              <div style={{ fontSize: "14px", color: "#991b1b", lineHeight: 1.7 }}>{booking.rejectionReason}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {resource && (
            <div style={{ ...card, padding: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Resource Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[{ label: "Type", value: resource.type?.replaceAll("_", " ") || "—" }, { label: "Capacity", value: resource.capacity }, { label: "Location", value: resource.location || "—" }, { label: "Status", value: resource.status || "—" }].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {isPending && (
                <>
                  <button onClick={() => onApprove(booking.id)} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "13px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.target.style.background = "#15803d")} onMouseLeave={(e) => (e.target.style.background = "#16a34a")}>✓ Approve Booking</button>
                  <button onClick={() => onReject(booking)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "13px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.target.style.background = "#fecaca")} onMouseLeave={(e) => (e.target.style.background = "#fee2e2")}>✕ Reject Booking</button>
                </>
              )}
              <button onClick={() => onDelete(booking.id)} style={{ background: "#fff", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)", padding: "13px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.target.style.background = "#fee2e2")} onMouseLeave={(e) => (e.target.style.background = "#fff")}>Delete Booking</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingRequests() {
  const navigate = useNavigate(); // ✅
  const [bookings, setBookings]         = useState([]);
  const [resources, setResources]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast]               = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "success" }), 3500); };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([getAllBookings(), getAllResources()]);
      setBookings(bookingsRes.data || []);
      setResources(resourcesRes.data || []);
    } catch { showToast("Failed to load bookings.", "error"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try { await approveBooking(id); showToast("Booking approved."); await fetchData(); setSelected((p) => p ? { ...p, status: "APPROVED" } : null); }
    catch { showToast("Failed to approve.", "error"); }
  };

  const handleRejectConfirm = async (reason) => {
    try { await rejectBooking(rejectTarget.id, reason); showToast("Booking rejected."); setRejectTarget(null); await fetchData(); setSelected((p) => p ? { ...p, status: "REJECTED", rejectionReason: reason } : null); }
    catch { showToast("Failed to reject.", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this booking?")) return;
    try { await deleteBooking(id); showToast("Booking deleted."); setSelected(null); fetchData(); }
    catch { showToast("Failed to delete.", "error"); }
  };

  const counts = { ALL: bookings.length, PENDING: bookings.filter((b) => b.status === "PENDING").length, APPROVED: bookings.filter((b) => b.status === "APPROVED").length, REJECTED: bookings.filter((b) => b.status === "REJECTED").length, CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length };

  const filtered = bookings
    .filter((b) => statusFilter === "ALL" || b.status === statusFilter)
    .filter((b) => search === "" || b.userName?.toLowerCase().includes(search.toLowerCase()) || b.userId?.toLowerCase().includes(search.toLowerCase()) || b.purpose?.toLowerCase().includes(search.toLowerCase()) || resources.find((r) => r.id === b.resourceId)?.name?.toLowerCase().includes(search.toLowerCase()));

  const container = { maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", paddingBottom: "80px" }}>

      {toast.msg && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#fff", border: `1px solid ${toast.type === "error" ? "rgba(220,38,38,0.3)" : "rgba(15,23,42,0.1)"}`, borderRadius: "14px", padding: "13px 20px", color: toast.type === "error" ? "#991b1b" : "#0f172a", fontSize: "14px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
          {toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      {rejectTarget && <RejectModal onConfirm={handleRejectConfirm} onClose={() => setRejectTarget(null)} />}

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)", padding: "50px 2rem 70px" }}>
        <div style={{ position: "absolute", top: "-120px", right: "-100px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

        <div style={{ ...container, position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 18px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "24px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            BOOKING MANAGEMENT
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "14px", maxWidth: "700px" }}>Booking Requests</h1>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.8, maxWidth: "560px" }}>Review, approve, or reject user booking requests from one place.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-end" }}>
              {/* Stats */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {[{ label: "Total", value: counts.ALL }, { label: "Pending", value: counts.PENDING }, { label: "Approved", value: counts.APPROVED }, { label: "Rejected", value: counts.REJECTED }].map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "14px 20px", minWidth: "80px", textAlign: "center" }}>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ✅ Check-In Scanner button */}
              <button
                onClick={() => navigate("/admin/checkin")}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary, #e1a604)", color: "#111827", border: "none", padding: "12px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 20px rgba(244,180,0,0.3)", whiteSpace: "nowrap", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                📷 Check-In Scanner
              </button>

              <button
                onClick={() => downloadBookingSummaryReport(bookings, resources)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.22)",
                  padding: "12px 22px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              >
              Download Report
              </button>

             
 
            </div>
          </div>
        </div>
      </section>
      

      {/* ── Content ── */}
      <div style={{ ...container, marginTop: "-32px", position: "relative", zIndex: 3, paddingTop: 0, paddingBottom: "40px" }}>
        {selected ? (
          <div style={{ paddingTop: "40px" }}>
            <BookingDetail booking={selected} resource={resources.find((r) => r.id === selected.resourceId)} onBack={() => setSelected(null)} onApprove={handleApprove} onReject={setRejectTarget} onDelete={handleDelete} />
          </div>
        ) : (
          <>
            <div style={{ ...card, padding: "20px 24px", marginBottom: "20px" }}>
              <input type="text" placeholder="Search by user, resource, or purpose..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", maxWidth: "360px", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(15,23,42,0.1)", fontSize: "14px", outline: "none", marginBottom: "14px", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? "var(--primary, #f4b400)" : "#fff", color: statusFilter === s ? "#111827" : "#64748b", border: statusFilter === s ? "none" : "1px solid rgba(15,23,42,0.08)", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s] ?? 0})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "14px" }}>{loading ? "Loading..." : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""} found`}</div>

            {loading ? (
              <div style={{ ...card, padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "15px" }}>Loading booking requests...</div>
            ) : filtered.length === 0 ? (
              <div style={{ ...card, padding: "60px", textAlign: "center" }}>
                <div style={{ fontSize: "38px", marginBottom: "12px" }}>📋</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>No bookings found</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Try adjusting your search or filter.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map((b) => (
                  <BookingCard key={b.id} booking={b} resource={resources.find((r) => r.id === b.resourceId)} onClick={() => setSelected(b)} />
                ))}

                
              </div>
            )}
          </>
        )}

         
      </div>
      
    </div>
  );
}