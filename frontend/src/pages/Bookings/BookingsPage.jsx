import { useState, useEffect } from "react";
import { getAllResources } from "../../api/resourceApi";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBooking,
} from "../../api/bookingApi";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "#fef9c3", color: "#854d0e" },
  APPROVED: { label: "Approved", bg: "#dcfce7", color: "#166534" },
  REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  CANCELLED: { label: "Cancelled", bg: "#f1f5f9", color: "#475569" },
};

const pageCardStyle = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "28px",
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

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "999px",
        padding: "6px 14px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function BookingForm({ onSuccess, onCancel }) {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getAllResources({ status: "ACTIVE" })
      .then((res) => setResources(res.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoadingResources(false));
  }, []);

  const selected = resources.find((r) => r.id === form.resourceId);

  const handleSubmit = async () => {
    const currentUser = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("name");

    setError("");

    if (
      !form.resourceId ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.purpose
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    if (!currentUser) {
      setError("User session not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      await createBooking({
        ...form,
        userId: currentUser,
        userName: currentUserName || currentUser,
        startTime: form.startTime + ":00",
        endTime: form.endTime + ":00",
        expectedAttendees: parseInt(form.expectedAttendees, 10),
      });

      onSuccess();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: "28px",
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ ...pageCardStyle, padding: "30px" }}>
          <div style={pillStyle}>New Request</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--text-dark)",
              marginBottom: "20px",
              letterSpacing: "-0.4px",
            }}
          >
            Booking Details
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "16px",
                padding: "14px 18px",
                color: "#991b1b",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Resource *</label>
              <select
                value={form.resourceId}
                onChange={(e) => set("resourceId", e.target.value)}
                style={inputStyle}
                disabled={loadingResources}
              >
                <option value="">
                  {loadingResources
                    ? "Loading resources..."
                    : "Select a resource..."}
                </option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.type?.replaceAll("_", " ")} (cap. {r.capacity})
                  </option>
                ))}
              </select>

              {!loadingResources && resources.length === 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#991b1b",
                    marginTop: "6px",
                    display: "block",
                  }}
                >
                  No active resources found. Please add resources in the
                  Facilities module first.
                </span>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Start Time *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>End Time *</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Purpose *</label>
              <input
                type="text"
                placeholder="e.g. Team meeting, Workshop, Study group..."
                value={form.purpose}
                onChange={(e) => set("purpose", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Expected Attendees *</label>
              <input
                type="number"
                min={1}
                max={selected?.capacity || 9999}
                value={form.expectedAttendees}
                onChange={(e) => set("expectedAttendees", e.target.value)}
                style={inputStyle}
              />
              {selected?.capacity && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                    display: "block",
                  }}
                >
                  Max capacity for this resource: {selected.capacity}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ ...pageCardStyle, padding: "30px" }}>
          <div style={pillStyle}>Preview</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--text-dark)",
              marginBottom: "18px",
              letterSpacing: "-0.4px",
            }}
          >
            Booking Summary
          </div>

          <div
            style={{
              background: "var(--bg-light)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: "22px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "6px",
              }}
            >
              Resource
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--text-dark)",
                marginBottom: "18px",
              }}
            >
              {selected?.name || "Not selected"}
            </div>

            {selected && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "16px",
                  marginTop: "-12px",
                }}
              >
                {selected.type?.replaceAll("_", " ")} · {selected.location} ·
                cap. {selected.capacity}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {[
                { label: "Date", value: form.date || "-" },
                { label: "Attendees", value: form.expectedAttendees },
                { label: "Start", value: form.startTime || "-" },
                { label: "End", value: form.endTime || "-" },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: "6px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-dark)",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {form.purpose && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "6px",
                  }}
                >
                  Purpose
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text-dark)",
                  }}
                >
                  {form.purpose}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ ...pageCardStyle, padding: "30px" }}>
          <div style={pillStyle}>Guidance</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--text-dark)",
              marginBottom: "18px",
              letterSpacing: "-0.4px",
            }}
          >
            Helpful Tips
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              "Bookings require admin approval before confirmation.",
              "Only ACTIVE resources are shown in the dropdown.",
              "You can cancel a pending or approved booking anytime.",
              "Rejected bookings will show a reason from the admin.",
            ].map((tip) => (
              <div
                key={tip}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--text-mid)",
                    lineHeight: 1.7,
                  }}
                >
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...pageCardStyle, padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSubmit}
              disabled={loading || loadingResources}
              style={{
                background: "var(--primary)",
                color: "#111827",
                border: "none",
                padding: "14px 24px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px rgba(244,180,0,0.22)",
                transition: "all 0.25s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Submitting..." : "Submit Booking Request"}
            </button>

            <button
              onClick={onCancel}
              style={{
                background: "#fff",
                color: "var(--text-dark)",
                border: "1px solid rgba(15,23,42,0.08)",
                padding: "14px 24px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.color = "var(--secondary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(15,23,42,0.08)";
                e.target.style.color = "var(--text-dark)";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditBookingModal({ booking, resources, onSave, onClose }) {
  const [form, setForm] = useState({
    date: booking.date || "",
    startTime: booking.startTime?.slice(0, 5) || "",
    endTime: booking.endTime?.slice(0, 5) || "",
    purpose: booking.purpose || "",
    expectedAttendees: booking.expectedAttendees || 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selected = resources.find(r => r.id === booking.resourceId);

  const handleSubmit = async () => {
    setError("");
    if (!form.date || !form.startTime || !form.endTime || !form.purpose) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }
    setLoading(true);
    try {
      await updateBooking(booking.id, {
        date: form.date,
        startTime: form.startTime + ":00",
        endTime: form.endTime + ":00",
        purpose: form.purpose,
        expectedAttendees: parseInt(form.expectedAttendees, 10),
      });
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-dark)", margin: 0 }}>Edit Booking</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-light)",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "#991b1b",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Resource: {selected?.name || booking.resourceId}</label>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {selected?.type?.replaceAll("_", " ")} · {selected?.location} · cap. {selected?.capacity}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Start Time *</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>End Time *</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Purpose *</label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Expected Attendees *</label>
            <input
              type="number"
              min="1"
              value={form.expectedAttendees}
              onChange={(e) => set("expectedAttendees", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              color: "var(--text-dark)",
              border: "none",
              padding: "12px 24px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "var(--primary)",
              color: "#111827",
              border: "none",
              padding: "12px 24px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onEdit, resources }) {
  const resource = resources.find((r) => r.id === booking.resourceId);
  const canCancel =
    booking.status === "PENDING" || booking.status === "APPROVED";
  const canEdit = canCancel;

  return (
    <div
      style={{
        ...pageCardStyle,
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(15,23,42,0.08)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,23,42,0.05)";
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
      }}
    >
      <div
        style={{
          height: "4px",
          background: STATUS_CONFIG[booking.status]?.bg || "#f1f5f9",
        }}
      />
      <div style={{ padding: "22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "14px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "5px",
              }}
            >
              {resource?.type?.replaceAll("_", " ") || "RESOURCE"}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text-dark)",
                letterSpacing: "-0.3px",
              }}
            >
              {resource?.name || booking.resourceId}
            </div>
            {resource?.location && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {resource.location}
              </div>
            )}
          </div>

          <StatusBadge status={booking.status} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          {[
            { label: "Date", value: booking.date },
            {
              label: "Time",
              value: `${booking.startTime?.slice(0, 5)} – ${booking.endTime?.slice(0, 5)}`,
            },
            { label: "Attendees", value: booking.expectedAttendees },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "4px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "4px",
            }}
          >
            Purpose
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-mid)",
              lineHeight: 1.6,
            }}
          >
            {booking.purpose}
          </div>
        </div>

        {booking.status === "REJECTED" && booking.rejectionReason && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid rgba(220,38,38,0.15)",
              borderRadius: "14px",
              padding: "12px 14px",
              fontSize: "13px",
              color: "#991b1b",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            <strong>Rejection reason:</strong> {booking.rejectionReason}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {canEdit && (
            <button
              onClick={() => onEdit(booking)}
              style={{
                background: "#fff",
                color: "var(--primary)",
                border: "1px solid rgba(244,180,0,0.3)",
                padding: "10px 18px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(244,180,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
              }}
            >
              ✏️ Edit
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              style={{
                background: "#fff",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.15)",
                padding: "10px 18px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#fee2e2";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
              }}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    bookingId: "",
    resourceId: "",
    dateFrom: "",
    dateTo: "",
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchBookings = async () => {
    const currentUser = localStorage.getItem("userId");

    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getMyBookings(currentUser);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllResources()
      .then((res) => setResources(res.data || []))
      .catch(() => setResources([]));

    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await cancelBooking(id);
      showToast("Booking cancelled.");
      fetchBookings();
    } catch (error) {
      console.error("Cancel failed:", error);
      showToast("Failed to cancel.");
    }
  };

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    APPROVED: bookings.filter((b) => b.status === "APPROVED").length,
    REJECTED: bookings.filter((b) => b.status === "REJECTED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  let filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  filtered = filtered.filter((b) => {
    const resource = resources.find((r) => r.id === b.resourceId);
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      (b.id || "").toLowerCase().includes(searchLower) ||
      (resource?.name || "").toLowerCase().includes(searchLower) ||
      (b.purpose || "").toLowerCase().includes(searchLower);

    const matchesBookingId =
      !advancedFilters.bookingId ||
      (b.id || "").includes(advancedFilters.bookingId);

    const matchesDateFrom =
      !advancedFilters.dateFrom || b.date >= advancedFilters.dateFrom;

    const matchesDateTo =
      !advancedFilters.dateTo || b.date <= advancedFilters.dateTo;

    const matchesResource =
      !advancedFilters.resourceId || b.resourceId === advancedFilters.resourceId;

    return (
      matchesSearch &&
      matchesBookingId &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesResource
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        paddingBottom: "90px",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: "16px",
            padding: "14px 20px",
            color: "var(--text-dark)",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
        >
          ✓ {toast}
        </div>
      )}

      {editBooking && (
        <EditBookingModal
          booking={editBooking}
          resources={resources}
          onSave={() => {
            showToast("Booking updated successfully!");
            setEditBooking(null);
            fetchBookings();
          }}
          onClose={() => setEditBooking(null)}
        />
      )}

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)",
          padding: "130px 2rem 70px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(244,180,0,0.12)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(70px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.88)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              marginBottom: "24px",
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
            BOOKING MANAGEMENT
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(34px, 5vw, 58px)",
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-1.5px",
                  marginBottom: "14px",
                  maxWidth: "760px",
                }}
              >
                Reserve and track your campus bookings.
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  maxWidth: "600px",
                }}
              >
                Book labs, halls, meeting rooms, and equipment. Track approval
                status and manage your reservations in one place.
              </p>
            </div>

            <button
              onClick={() => setShowForm((v) => !v)}
              style={{
                background: showForm
                  ? "rgba(255,255,255,0.1)"
                  : "var(--primary)",
                color: showForm ? "#fff" : "#111827",
                border: showForm
                  ? "1px solid rgba(255,255,255,0.2)"
                  : "none",
                padding: "14px 26px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: showForm
                  ? "none"
                  : "0 10px 24px rgba(244,180,0,0.22)",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              {showForm ? "✕ Cancel" : "+ Book a Resource"}
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 2rem 0",
        }}
      >
        {showForm && (
          <div style={{ marginBottom: "32px" }}>
            <BookingForm
              onSuccess={() => {
                showToast("Booking submitted! Awaiting admin approval.");
                setShowForm(false);
                fetchBookings();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div style={{ ...pageCardStyle, padding: "28px" }}>
          <div style={pillStyle}>My Bookings</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--text-dark)",
                letterSpacing: "-0.5px",
              }}
            >
              Your Booking History
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-light)" }}>
              {loading
                ? "Loading..."
                : `${filtered.length} booking${
                    filtered.length !== 1 ? "s" : ""
                  } found`}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "flex-end",
                marginBottom: showAdvanced ? "16px" : "0",
              }}
            >
              <div style={{ flex: 1, minWidth: "250px" }}>
                <label style={labelStyle}>Search</label>
                <input
                  type="text"
                  placeholder="Search by booking ID, purpose..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  background: showAdvanced ? "var(--primary)" : "#fff",
                  color: showAdvanced ? "#111827" : "var(--text-dark)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ⚙️ Advanced
              </button>

              {(searchQuery ||
                advancedFilters.bookingId ||
                advancedFilters.dateFrom ||
                advancedFilters.dateTo ||
                advancedFilters.resourceId) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAdvancedFilters({
                      bookingId: "",
                      resourceId: "",
                      dateFrom: "",
                      dateTo: "",
                    });
                  }}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {showAdvanced && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <div>
                  <label style={labelStyle}>Booking ID</label>
                  <input
                    type="text"
                    placeholder="e.g., B12345..."
                    value={advancedFilters.bookingId}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        bookingId: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Resource</label>
                  <select
                    value={advancedFilters.resourceId}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        resourceId: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">All Resources</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.label || r.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date From</label>
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateFrom: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Date To</label>
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateTo: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total Bookings", value: counts.ALL, color: "#9ca3af" },
              { label: "Pending", value: counts.PENDING, color: "#fbbf24" },
              { label: "Approved", value: counts.APPROVED, color: "#15803d" },
              { label: "Rejected", value: counts.REJECTED, color: "#991b1b" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#f3f4f6",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  textAlign: "center",
                  minWidth: "110px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: s.color,
                    letterSpacing: "-1px",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-light)",
                    marginTop: "4px",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    background: filter === s ? "var(--primary)" : "#fff",
                    color: filter === s ? "#111827" : "var(--text-light)",
                    border:
                      filter === s
                        ? "none"
                        : "1px solid rgba(15,23,42,0.08)",
                    borderRadius: "999px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: filter === s ? 700 : 500,
                    cursor: "pointer",
                    boxShadow:
                      filter === s
                        ? "0 4px 12px rgba(244,180,0,0.2)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {s === "ALL" ? "All" : STATUS_CONFIG[s].label} ({counts[s]})
                </button>
              )
            )}
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "var(--text-light)",
                fontSize: "16px",
              }}
            >
              Loading your bookings...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>📅</div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  marginBottom: "10px",
                }}
              >
                No bookings found
              </div>
              <div
                style={{
                  color: "var(--text-light)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                {filter === "ALL"
                  ? "Click '+ Book a Resource' above to make your first booking."
                  : `No ${filter.toLowerCase()} bookings to show.`}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {filtered.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={handleCancel}
                  onEdit={setEditBooking}
                  resources={resources}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}