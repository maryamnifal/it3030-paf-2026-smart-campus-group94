import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Shows "📱 View QR Code" button on APPROVED booking cards.
// Clicking opens a PROPER CENTERED MODAL — same style as Edit Booking dialog.

export default function QRCodeDisplay({ booking, resourceName }) {
  const [show, setShow] = useState(false);

  // 8-char short code for manual entry
  const shortCode = booking.id?.slice(-8).toUpperCase() || "";

  // Only for APPROVED bookings
  if (booking.status !== "APPROVED") return null;

  return (
    <>
      {/* ── Trigger button on booking card ── */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click bubbling
          setShow(true);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#196136",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          padding: "10px 20px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "background 0.15s",
          fontFamily: "inherit",
          boxShadow: "0 4px 14px rgba(22,163,74,0.25)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#181a19")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0f7735")}
      >
        View QR Code
      </button>

      {show && (
        <div
          onClick={() => setShow(false)}
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
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              width: "440px",
              maxWidth: "100%",
              maxHeight: "30vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(20, 20, 20, 0.3)",
              position: "relative",
            }}
          >
            {/* ── Modal header row: back arrow + title + close X ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}>
              {/* Back / close arrow */}
              
              <h2 style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}>
                Booking QR Code
              </h2>

              {/* X close button */}
              <button
                onClick={() => setShow(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0",
                  lineHeight: 1,
                  fontFamily: "inherit",
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* ── Approved status badge ── */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#dcfce7",
                color: "#15803d",
                borderRadius: "999px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                BOOKING APPROVED
              </span>
            </div>

            {/* ── QR Code — large, clear, centered ── */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}>
              <div style={{
                padding: "20px",
                background: "#fff",
                border: "2px solid #e2e8f0",
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
              }}>
                {/* level="H" = highest error correction → clearest scan */}
                <QRCodeSVG
                  value={booking.id}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* ── Booking code for manual entry ── */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "8px",
              }}>
                Booking Code (for manual entry)
              </div>
              <div style={{
                fontFamily: "monospace",
                fontSize: "26px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "6px",
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "12px 20px",
                display: "inline-block",
                border: "1.5px dashed #cbd5e1",
              }}>
                {shortCode}
              </div>
            </div>

            {/* ── Booking detail rows (like Edit modal detail section) ── */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "16px 18px",
              marginBottom: "24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}>
              {[
                { label: "Resource",  value: resourceName || "—" },
                { label: "Date",      value: booking.date },
                { label: "Time",      value: `${booking.startTime?.slice(0,5)} – ${booking.endTime?.slice(0,5)}` },
                { label: "Attendees", value: booking.expectedAttendees },
                { label: "Booked by", value: booking.userName || booking.userId },
                { label: "Purpose",   value: booking.purpose || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginBottom: "3px",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: "13px",
              color: "#94a3b8",
              textAlign: "center",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}>
              Show this QR code to the admin at the venue. They will scan it or enter the code above to confirm your attendance.
            </p>

            {/* ── Close button — same as Edit modal Cancel ── */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShow(false)}
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  color: "#0f172a",
                  border: "none",
                  padding: "13px 24px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              >
                ← Back to Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}