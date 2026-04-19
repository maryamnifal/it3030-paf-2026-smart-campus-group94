import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBookings, checkInBooking } from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";

const card = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
};

// ─── Verify result card ───────────────────────────────────────────────────────
function VerifyResult({ result, resource, onCheckIn, onReset, checkingIn }) {
  const stateMap = {
    APPROVED:   { icon: "✓",  bg: "#dcfce7", color: "#15803d", title: "Booking Verified!",     sub: "This booking is approved and ready for check-in." },
    CHECKED_IN: { icon: "✓✓", bg: "#d1fae5", color: "#065f46", title: "Already Checked In",    sub: "This booking has already been verified and checked in." },
    PENDING:    { icon: "⏳", bg: "#fef3c7", color: "#92400e", title: "Not Yet Approved",      sub: "This booking is still waiting for admin approval." },
    REJECTED:   { icon: "✕",  bg: "#fee2e2", color: "#991b1b", title: "Booking Rejected",      sub: result.booking?.rejectionReason || "This booking was rejected." },
    CANCELLED:  { icon: "✕",  bg: "#f1f5f9", color: "#475569", title: "Booking Cancelled",     sub: "This booking was cancelled by the user." },
    NOT_FOUND:  { icon: "?",  bg: "#fef3c7", color: "#92400e", title: "Booking Not Found",     sub: "No booking matches this ID. Please check and try again." },
    EXPIRED:    { icon: "⚠",  bg: "#fee2e2", color: "#991b1b", title: "Booking Expired",       sub: `This booking was for ${result.booking?.date}. It is no longer valid.` },
  };
  const st = stateMap[result.status] || stateMap.NOT_FOUND;

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{ background: st.bg, padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "52px", fontWeight: 900, color: st.color, lineHeight: 1, marginBottom: "10px" }}>{st.icon}</div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: st.color, marginBottom: "6px" }}>{st.title}</div>
        <div style={{ fontSize: "14px", color: st.color, opacity: 0.85, lineHeight: 1.5 }}>{st.sub}</div>
      </div>

      {result.booking && result.status !== "NOT_FOUND" && (
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Booking Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
            {[
              { label: "Resource",  value: resource?.name || result.booking.resourceId },
              { label: "Booked by", value: result.booking.userName || result.booking.userId },
              { label: "Date",      value: result.booking.date },
              { label: "Time",      value: `${result.booking.startTime?.slice(0,5)} – ${result.booking.endTime?.slice(0,5)}` },
              { label: "Attendees", value: result.booking.expectedAttendees },
              { label: "Purpose",   value: result.booking.purpose || "—" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#64748b", marginBottom: "18px" }}>
            Full ID: <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: 600 }}>{result.booking.id}</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {result.status === "APPROVED" && (
              <button
                onClick={onCheckIn}
                disabled={checkingIn}
                style={{ flex: 1, background: checkingIn ? "#f1f5f9" : "#16a34a", color: checkingIn ? "#94a3b8" : "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: checkingIn ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => { if (!checkingIn) e.currentTarget.style.background = "#15803d"; }}
                onMouseLeave={(e) => { if (!checkingIn) e.currentTarget.style.background = "#16a34a"; }}
              >
                {checkingIn ? "Confirming..." : "✓ Confirm Check-In"}
              </button>
            )}
            <button onClick={onReset} style={{ flex: result.status === "APPROVED" ? "0 0 auto" : 1, background: "#f8fafc", color: "#64748b", border: "1px solid rgba(15,23,42,0.08)", padding: "14px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Verify Another
            </button>
          </div>
        </div>
      )}

      {result.status === "NOT_FOUND" && (
        <div style={{ padding: "20px 28px" }}>
          <button onClick={onReset} style={{ width: "100%", background: "#0f172a", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function CheckedInSuccess({ booking, resource, onReset }) {
  return (
    <div style={{ ...card, overflow: "hidden", textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg, #065f46, #047857)", padding: "48px 32px" }}>
        <div style={{ fontSize: "64px", marginBottom: "12px" }}>✅</div>
        <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Checked In Successfully!</div>
        <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>Attendance confirmed.</div>
      </div>
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px", textAlign: "left" }}>
          {[
            { label: "Resource",  value: resource?.name || booking.resourceId },
            { label: "Booked by", value: booking.userName || booking.userId },
            { label: "Date",      value: booking.date },
            { label: "Time",      value: `${booking.startTime?.slice(0,5)} – ${booking.endTime?.slice(0,5)}` },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{item.label}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
            </div>
          ))}
        </div>
        <button onClick={onReset} style={{ width: "100%", background: "#0f172a", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Verify Another Booking
        </button>
      </div>
    </div>
  );
}

// ─── Camera Scanner ───────────────────────────────────────────────────────────
function CameraScanner({ onScan, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const intervalRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState("");
  const [jsQRLoaded, setJsQRLoaded] = useState(!!window.jsQR);

  useEffect(() => {
    if (!window.jsQR) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
      s.onload = () => setJsQRLoaded(true);
      s.onerror = () => setCamError("Could not load QR scanner library.");
      document.head.appendChild(s);
    }
  }, []);

  const startCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch {
      setCamError("Camera access denied. Please allow camera permission in your browser settings.");
    }
  };

  const stopCamera = () => {
    setScanning(false);
    clearInterval(intervalRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!scanning || !jsQRLoaded) return;
    intervalRef.current = setInterval(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        stopCamera();
        onScan(code.data);
      }
    }, 300);
    return () => clearInterval(intervalRef.current);
  }, [scanning, jsQRLoaded]);

  useEffect(() => () => stopCamera(), []);

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>📷 Camera Scanner</div>
          <button onClick={() => { stopCamera(); onClose(); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Point camera at the user's QR code — detected automatically.</div>
      </div>

      <div style={{ padding: "24px" }}>
        {camError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
            {camError}
          </div>
        )}

        {/* Viewfinder */}
        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#0f172a", aspectRatio: "1", maxWidth: "320px", margin: "0 auto 20px", display: scanning ? "block" : "none" }}>
          <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} playsInline muted />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {/* Corner guides */}
          {[
            { top: "12px", left: "12px", borderTop: "3px solid", borderLeft: "3px solid" },
            { top: "12px", right: "12px", borderTop: "3px solid", borderRight: "3px solid" },
            { bottom: "12px", left: "12px", borderBottom: "3px solid", borderLeft: "3px solid" },
            { bottom: "12px", right: "12px", borderBottom: "3px solid", borderRight: "3px solid" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: "28px", height: "28px", borderColor: "#f4b400", opacity: 0.95, ...s }} />
          ))}
          {/* Scanning line animation */}
          <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "rgba(244,180,0,0.8)", animation: "scanLine 2s linear infinite", top: "50%" }} />
        </div>

        <style>{`@keyframes scanLine { 0%{top:10%} 50%{top:90%} 100%{top:10%} }`}</style>

        {!scanning ? (
          <button
            onClick={startCamera}
            style={{ width: "100%", background: "#0f172a", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            📷 Start Camera
          </button>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>Scanning... Point at the QR code</div>
            <button onClick={stopCamera} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "11px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Stop Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckInVerify() {
  const navigate = useNavigate();
  const [bookings, setBookings]     = useState([]);
  const [resources, setResources]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [input, setInput]           = useState("");
  const [result, setResult]         = useState(null);
  const [checkedIn, setCheckedIn]   = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    Promise.all([getAllBookings(), getAllResources()])
      .then(([bRes, rRes]) => { setBookings(bRes.data || []); setResources(rRes.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verify = (raw) => {
    const q = raw.trim().toUpperCase();
    if (!q) return;
    setVerifying(true);
    setShowCamera(false);
    setTimeout(() => {
      const booking = bookings.find(
        (b) => b.id === raw.trim() || b.id.slice(-8).toUpperCase() === q
      );
      if (!booking) { setResult({ status: "NOT_FOUND" }); setVerifying(false); return; }
      const today   = new Date().toISOString().slice(0, 10);
      const expired = booking.date < today && booking.status === "APPROVED";
      setResult({ status: expired ? "EXPIRED" : booking.status, booking });
      setVerifying(false);
    }, 400);
  };

  const handleCheckIn = async () => {
    if (!result?.booking) return;
    setCheckingIn(true);
    try {
      await checkInBooking(result.booking.id);
      setCheckedIn(result.booking);
      setResult(null);
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (e) {
      alert(e.response?.data?.message || "Check-in failed. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const reset = () => { setResult(null); setCheckedIn(null); setInput(""); setShowCamera(false); };

  const today = new Date().toISOString().slice(0, 10);
  const todayApproved = bookings.filter((b) => b.status === "APPROVED" && b.date === today);

  const container = { maxWidth: "640px", margin: "0 auto", padding: "0 1.5rem" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", paddingBottom: "80px" }}>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)", padding: "80px 2rem 50px" }}>
        <div style={{ position: "absolute", top: "-100px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

       <div style={{ ...container, position: "relative", zIndex: 2 }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600, marginBottom: "16px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary, #f4b400)", display: "inline-block" }} />
            ADMIN · CHECK-IN
          </div>

          <h1 style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: "10px" }}>
            QR Check-In Verification
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", lineHeight: 1.7 }}>
            Scan the user's QR code with your camera, or enter the 8-character booking code manually to verify attendance.
            
          </p>

          {/* ✅ Back button */}
          <button
            onClick={() => navigate("/admin/bookings")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "999px", padding: "7px 16px",
              color: "rgba(255,255,255,0.88)", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", margintop: "20px", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
          >
            ← Back to Booking Requests
          </button>

        </div>
      </section>

      <div style={{ ...container, marginTop: "-24px", position: "relative", zIndex: 3 }}>

        {loading ? (
          <div style={{ ...card, padding: "60px", textAlign: "center", color: "#94a3b8" }}>Loading bookings...</div>

        ) : checkedIn ? (
          <CheckedInSuccess booking={checkedIn} resource={resources.find((r) => r.id === checkedIn.resourceId)} onReset={reset} />

        ) : result ? (
          <VerifyResult result={result} resource={result.booking ? resources.find((r) => r.id === result.booking.resourceId) : null} onCheckIn={handleCheckIn} onReset={reset} checkingIn={checkingIn} />

        ) : (
          <>
            {/* ── Mode toggle: Manual | Camera ── */}
            <div style={{ ...card, padding: "6px", display: "flex", gap: "4px", marginBottom: "16px" }}>
               <button
                onClick={() => setShowCamera(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "14px", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: !showCamera ? "#0f172a" : "transparent", color: !showCamera ? "#fff" : "#64748b", transition: "all 0.15s" }}
              >
                ✏️ Enter Booking Code
              </button>
              <button
                onClick={() => setShowCamera(true)}
                style={{ flex: 1, padding: "12px", borderRadius: "14px", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: showCamera ? "#0f172a" : "transparent", color: showCamera ? "#fff" : "#64748b", transition: "all 0.15s" }}
              >
                📷 Scan QR Camera
              </button>
            </div>

            {/* ── Camera mode ── */}
            {showCamera && (
              <div style={{ marginBottom: "16px" }}>
                <CameraScanner onScan={(data) => { setInput(data); verify(data); }} onClose={() => setShowCamera(false)} />
              </div>
            )}

            {/* ── Manual entry ── */}
            {!showCamera && (
              <div style={{ ...card, padding: "28px", marginBottom: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Enter Booking ID or Code</div>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", lineHeight: 1.6 }}>
                  Ask the user to show their <strong>View QR Code</strong> modal and read the 8-character code, or paste the full booking ID.
                </p>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && verify(input)}
                  placeholder="e.g.  A3F9C1B2  or paste full ID..."
                  maxLength={100}
                  autoFocus
                  style={{
                    width: "100%", padding: "16px 18px",
                    borderRadius: "14px", border: "1.5px solid rgba(15,23,42,0.12)",
                    fontSize: "18px", outline: "none", boxSizing: "border-box",
                    fontFamily: "monospace", letterSpacing: "2px", color: "#0f172a",
                    marginBottom: "14px", transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f4b400")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(15,23,42,0.12)")}
                />

                <button
                  onClick={() => verify(input)}
                  disabled={!input.trim() || verifying}
                  style={{
                    width: "100%",
                    background: input.trim() && !verifying ? "#0f172a" : "#f1f5f9",
                    color: input.trim() && !verifying ? "#fff" : "#94a3b8",
                    border: "none", padding: "15px", borderRadius: "12px",
                    fontSize: "15px", fontWeight: 700,
                    cursor: input.trim() && !verifying ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                  }}
                >
                  {verifying ? "Verifying..." : "🔍 Verify Booking"}
                </button>

                <div style={{ marginTop: "18px", background: "#f8fafc", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>HOW IT WORKS</div>
                  {["1. User opens their Bookings page", "2. On an APPROVED booking, they tap 'View QR Code'", "3. Modal shows QR + 8-character booking code", "4. Admin enters the code here OR scans with camera", "5. Click 'Confirm Check-In' to mark attendance"].map((s) => (
                    <div key={s} style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Today's approved bookings quick-pick ── */}
            {todayApproved.length > 0 && (
              <div style={{ ...card, padding: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Today's Approved Bookings</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "14px" }}>Click any row to verify instantly.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {todayApproved.map((b) => {
                    const res = resources.find((r) => r.id === b.resourceId);
                    return (
                      <div key={b.id} onClick={() => { setInput(b.id.slice(-8).toUpperCase()); verify(b.id); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: "12px", border: "1px solid rgba(15,23,42,0.06)", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.3)"; e.currentTarget.style.background = "#f0fdf4"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)"; e.currentTarget.style.background = "#f8fafc"; }}
                      >
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{res?.name || b.resourceId}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{b.startTime?.slice(0,5)} – {b.endTime?.slice(0,5)} · {b.userName}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748b", background: "#e2e8f0", borderRadius: "6px", padding: "3px 8px" }}>{b.id.slice(-8).toUpperCase()}</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: "999px", padding: "4px 10px" }}>APPROVED</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {todayApproved.length === 0 && !loading && (
              <div style={{ ...card, padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📅</div>
                <div style={{ fontSize: "14px" }}>No approved bookings for today yet.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}