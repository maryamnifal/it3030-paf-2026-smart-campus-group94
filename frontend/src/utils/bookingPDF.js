import jsPDF from "jspdf";
 
// ─────────────────────────────────────────────────────────────────────────────
// PDF UTILITY — uses jsPDF (npm install jspdf)
//
// Exports:
//   generateBookingId(booking, resourceType) → e.g. "ROOM#10234"
//   downloadBookingConfirmation(booking, resourceName, resourceDetails)
//   downloadBookingSummaryReport(bookings, resources)
// ─────────────────────────────────────────────────────────────────────────────
 
const BRAND  = "#38383c";
const GOLD   = "#f4b400";
const GREEN  = "#117034";
const MUTED  = "#64748b";
const LIGHT  = "#f8fafc";
const BORDER = "#e2e8f0";
 
// ─────────────────────────────────────────────────────────────────────────────
// ✅ Human-readable Booking ID generator
//
// Format:  RESOURCETYPE#12345
// Examples:
//   ROOM#10234   LAB#58291   HALL#73901   EQUIPMENT#44102
//   LECTURE_HALL → HALL    SMART_CLASSROOM → ROOM
//
// The 5-digit number is derived deterministically from the MongoDB ID
// so the same booking always gets the same readable ID.
// ─────────────────────────────────────────────────────────────────────────────
export function generateBookingId(booking, resourceType) {
  // Shorten verbose resource types to clean prefix
  const typeMap = {
    LECTURE_HALL:     "HALL",
    SMART_CLASSROOM:  "ROOM",
    CLASSROOM:        "ROOM",
    MEETING_ROOM:     "ROOM",
    SEMINAR_ROOM:     "ROOM",
    CONFERENCE_ROOM:  "CONF",
    COMPUTER_LAB:     "LAB",
    SCIENCE_LAB:      "LAB",
    LABORATORY:       "LAB",
    EQUIPMENT:        "EQUIP",
    AV_ROOM:          "AV",
    AUDITORIUM:       "AUD",
    SPORTS_HALL:      "SPORT",
  };
 
  const raw = (resourceType || "RESOURCE").toUpperCase().replaceAll(" ", "_");
  const prefix = typeMap[raw] || raw.slice(0, 5); // max 5 chars if not mapped
 
  // Derive a stable 5-digit number from the MongoDB ObjectId hex string
  const hex = (booking.id || "000000000000").slice(-10); // last 10 hex chars
  const num  = parseInt(hex, 16) % 90000 + 10000;        // always 10000–99999
 
  return `${prefix}#${num}`;
}
// ─── Shared helpers ───────────────────────────────────────────────────────────

function addHeader(doc, subtitle) {


  // Logo area
  doc.setFillColor(244, 180, 0);
  doc.roundedRect(14, 12, 12, 12, 2, 2, "F");

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("U", 18, 20);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("Uni", 30, 20);

  doc.setTextColor(244, 180, 0);
  doc.text("Sphere", 40, 20);


  return 40; // y position after header
}

function addFooter(doc, pageNum) {
  const y = 285;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("UniSphere Smart Campus System", 14, y + 5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, y + 5, { align: "right" });
  if (pageNum) doc.text(`Page ${pageNum}`, 105, y + 5, { align: "center" });
}
 


// ─────────────────────────────────────────────────────────────────────────────
// 1. USER — Booking Confirmation Receipt PDF
// ─────────────────────────────────────────────────────────────────────────────
export function downloadBookingConfirmation(booking, resourceName, resourceDetails) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = addHeader(doc, "Booking Confirmation");
 
  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Booking Receipt", 14, 36);

  // ✅ Generate the human-readable ID
  const readableId = generateBookingId(booking, resourceDetails?.type || "RESOURCE");
 
  // ── Confirmed banner ──
  y += 6;
  doc.setFillColor(GREEN);
  doc.setTextColor("#ffffff");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.roundedRect(14, y, 182, 12, 2, 2, "F");
  doc.text("BOOKING CONFIRMED", 105, y + 8, { align: "center" });
  y += 18;
 
  // ── Booking ID banner — now shows ROOM#10234 instead of raw MongoDB ID ──
  doc.setFillColor(LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 20, 2, 2, "FD");
 
  // Label
  doc.setTextColor(MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING ID", 105, y + 6, { align: "center" });
 
  // ✅ Big readable ID — e.g. ROOM#10234
  doc.setTextColor(BRAND);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(readableId, 105, y + 15, { align: "center" });
 
  // Small raw ID below for reference
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(`(ref: ${booking.id})`, 105, y + 19, { align: "center" });
  y += 28;
 
  // ── Two-column layout ──
  doc.setFillColor(LIGHT);
  doc.roundedRect(14, y, 86, 80, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED);
  doc.text("RESOURCE DETAILS", 20, y + 8);
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(20, y + 10, 60, y + 10);
 
  let ly = y + 18;
  [
    ["Resource",  resourceName || booking.resourceId],
    ["Type",      resourceDetails?.type?.replaceAll("_", " ") || "—"],
    ["Location",  resourceDetails?.location || "—"],
    ["Capacity",  resourceDetails?.capacity ? `${resourceDetails.capacity} people` : "—"],
  ].forEach(([label, val]) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
    doc.text(label, 20, ly);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
    doc.text(String(val), 20, ly + 5);
    ly += 14;
  });
 
  doc.setFillColor(LIGHT);
  doc.roundedRect(106, y, 90, 80, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED);
  doc.text("BOOKING DETAILS", 112, y + 8);
  doc.setDrawColor(GOLD);
  doc.line(112, y + 10, 152, y + 10);
 
  let ry = y + 18;
  [
    ["Date",      booking.date],
    ["Time",      `${booking.startTime?.slice(0,5) || "—"} – ${booking.endTime?.slice(0,5) || "—"}`],
    ["Attendees", booking.expectedAttendees],
    ["Purpose",   booking.purpose || "—"],
  ].forEach(([label, val]) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
    doc.text(label, 112, ry);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
    const lines = doc.splitTextToSize(String(val), 78);
    doc.text(lines[0], 112, ry + 5);
    ry += 14;
  });
  y += 88;
 
  // ── Requester + status ──
  doc.setFillColor(LIGHT);
  doc.roundedRect(14, y, 182, 22, 2, 2, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
  doc.text("REQUESTED BY", 20, y + 7);
  doc.text("STATUS", 110, y + 7);
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
  doc.text(booking.userName || booking.userId || "—", 20, y + 15);
 
  doc.setFillColor(GREEN);
  doc.roundedRect(108, y + 8, 30, 8, 2, 2, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("APPROVED", 123, y + 14, { align: "center" });
  doc.setTextColor(BRAND);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Approved by Admin", 145, y + 15);
  y += 30;
 
  // ── Important note ──
  doc.setFillColor("#fefce8");
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 182, 24, 2, 2, "FD");
  doc.setTextColor("#854d0e");
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT", 20, y + 7);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  const note = "Please arrive 5 minutes before your booking time. Show this confirmation or your QR code at the venue for check-in verification. Cancellations must be made at least 1 hour before the booking start time.";
  doc.text(doc.splitTextToSize(note, 170), 20, y + 14);
  y += 32;
 
  doc.setFontSize(8); doc.setTextColor(MUTED); doc.setFont("helvetica", "italic");
  doc.text(`This document was auto-generated on ${new Date().toLocaleString()} by UniSphere Smart Campus.`, 105, y, { align: "center" });
 
  addFooter(doc);
 
  // ✅ File name also uses readable ID
  doc.save(`booking-${readableId.replace("#", "-")}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADMIN — Booking Summary Report PDF
// ─────────────────────────────────────────────────────────────────────────────
export function downloadBookingSummaryReport(bookings, resources) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = addHeader(doc, "Booking Summary Report");
  let page = 1;
 
  y += 4;
  doc.setTextColor("#222226");
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("Booking Summary Report", 105, y, { align: "center" });
  y += 6;
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(MUTED);
  doc.text(`Report generated: ${new Date().toLocaleString()}  |  Total records: ${bookings.length}`, 105, y, { align: "center" });
  y += 8;
 
  // ── Stats row ──
  const statuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "CHECKED_IN"];
  const counts = {};
  statuses.forEach((s) => { counts[s] = bookings.filter((b) => b.status === s).length; });
  const statColors = { PENDING: "#f59e0b", APPROVED: "#16a34a", REJECTED: "#dc2626", CANCELLED: "#94a3b8", CHECKED_IN: "#0891b2" };
 
  const boxW = 34;
  const boxX = [14, 50, 86, 122, 158];
  statuses.forEach((s, i) => {
    doc.setFillColor(LIGHT);
    doc.setDrawColor(BORDER);
    doc.roundedRect(boxX[i], y, boxW, 20, 2, 2, "FD");
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(statColors[s]);
    doc.text(String(counts[s]), boxX[i] + boxW / 2, y + 11, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(MUTED);
    doc.text(s.replace("_", " "), boxX[i] + boxW / 2, y + 17, { align: "center" });
  });
  y += 28;
 
  // ── Table header — ✅ includes Booking ID column ──
  const cols = [
    { label: "Booking ID",  x: 14,  w: 30 },
    { label: "Resource",    x: 46,  w: 40 },
    { label: "Booked by",   x: 88,  w: 34 },
    { label: "Date",        x: 124, w: 22 },
    { label: "Time",        x: 148, w: 22 },
    { label: "Status",      x: 172, w: 24 },
  ];
 
  doc.setFillColor(BRAND);
  doc.rect(14, y, 182, 9, "F");
  cols.forEach((col) => {
    doc.setTextColor("#ffffff"); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(col.label, col.x + 1, y + 6);
  });
  y += 9;
 
  // ── Table rows ──
  bookings.forEach((booking, index) => {
    if (y > 268) {
      addFooter(doc, page);
      doc.addPage();
      page++;
      y = addHeader(doc, "Booking Summary Report — continued");
      y += 4;
      doc.setFillColor(BRAND);
      doc.rect(14, y, 182, 9, "F");
      cols.forEach((col) => {
        doc.setTextColor("#ffffff"); doc.setFontSize(8); doc.setFont("helvetica", "bold");
        doc.text(col.label, col.x + 1, y + 6);
      });
      y += 9;
    }
 
    const resource = resources.find((r) => r.id === booking.resourceId);
    // ✅ Use readable ID in table too
    const readableId = generateBookingId(booking, resource?.type);
 
    const rowBg = index % 2 === 0 ? "#ffffff" : LIGHT;
    doc.setFillColor(rowBg);
    doc.rect(14, y, 182, 8, "F");
    doc.setDrawColor(BORDER); doc.setLineWidth(0.2);
    doc.line(14, y + 8, 196, y + 8);
 
    const rowData = [
      { col: cols[0], val: readableId },                  // ✅ readable ID
      { col: cols[1], val: resource?.name || booking.resourceId },
      { col: cols[2], val: booking.userName || booking.userId },
      { col: cols[3], val: booking.date },
      { col: cols[4], val: `${booking.startTime?.slice(0,5)||"?"} – ${booking.endTime?.slice(0,5)||"?"}` },
    ];
 
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    rowData.forEach(({ col, val }) => {
      doc.setTextColor(BRAND);
      doc.text(doc.splitTextToSize(val, col.w - 2)[0], col.x + 1, y + 5.5);
    });
 
    // Status badge
    doc.setFillColor(statColors[booking.status] || MUTED);
    doc.roundedRect(cols[5].x, y + 1.5, cols[5].w, 5, 1, 1, "F");
    doc.setTextColor("#ffffff"); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
    doc.text((booking.status || "").replace("_", " "), cols[5].x + cols[5].w / 2, y + 5.5, { align: "center" });
 
    y += 8;
  });
 
  // ── Summary ──
  if (y < 240) {
    y += 8;
    doc.setDrawColor(BORDER); doc.line(14, y, 196, y);
    y += 6;
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(BRAND);
    doc.text("Report Summary", 14, y);
    y += 6;
 
    const resourceCounts = {};
    bookings.forEach((b) => {
      const res = resources.find((r) => r.id === b.resourceId);
      const name = res?.name || b.resourceId;
      resourceCounts[name] = (resourceCounts[name] || 0) + 1;
    });
    const topResource = Object.entries(resourceCounts).sort((a, b) => b[1] - a[1])[0];
 
    [
      ["Total bookings in report", String(bookings.length)],
      ["Most booked resource",     topResource ? `${topResource[0]} (${topResource[1]} bookings)` : "N/A"],
      ["Approval rate",            bookings.length ? `${Math.round((counts.APPROVED / bookings.length) * 100)}%` : "0%"],
      ["Check-in rate",            (counts.APPROVED + counts.CHECKED_IN) ? `${Math.round((counts.CHECKED_IN / (counts.APPROVED + counts.CHECKED_IN)) * 100)}%` : "0%"],
    ].forEach(([label, val]) => {
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(MUTED);
      doc.text(label, 14, y);
      doc.setFont("helvetica", "bold"); doc.setTextColor(BRAND);
      doc.text(val, 100, y);
      y += 6;
    });
  }
 
  addFooter(doc, page);
  doc.save(`unisphere-booking-report-${new Date().toISOString().slice(0,10)}.pdf`);
}
 