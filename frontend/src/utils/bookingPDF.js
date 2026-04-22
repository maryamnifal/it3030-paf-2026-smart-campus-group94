import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// PDF UTILITY — uses jsPDF (npm install jspdf)
//
// Exports two functions:
//   1. downloadBookingConfirmation(booking, resourceName) → user receipt PDF
//   2. downloadBookingSummaryReport(bookings, resources)  → admin report PDF
// ─────────────────────────────────────────────────────────────────────────────

const BRAND   = "#4c4c4d";   // dark navy
const GOLD    = "#f4b400";   // UniSphere yellow
const GREEN   = "#137a39";   // approved green
const MUTED   = "#64748b";   // muted text
const LIGHT   = "#f8fafc";   // light bg
const BORDER  = "#e2e8f0";   // divider

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

function labelValue(doc, y, label, value, xLabel = 14, xValue = 75) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED);
  doc.text(label.toUpperCase(), xLabel, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(BRAND);
  doc.setFontSize(11);
  doc.text(String(value ?? "—"), xValue, y);
  return y + 8;
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

  // ── Confirmation title ──
  y += 6;
  doc.setFillColor(GREEN);
  doc.setTextColor("#ffffff");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.roundedRect(14, y, 182, 12, 2, 2, "F");
  doc.text("BOOKING CONFIRMED", 105, y + 8, { align: "center" });
  y += 18;

  // ── Booking ID banner ──
  doc.setFillColor(LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 14, 2, 2, "FD");
  doc.setTextColor(MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING ID", 105, y + 5, { align: "center" });
  doc.setTextColor(BRAND);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(booking.id || "—", 105, y + 11, { align: "center" });
  y += 22;

  // ── Two-column layout ──
  // Left column: Resource & Schedule
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
  const leftItems = [
    ["Resource",  resourceName || booking.resourceId],
    ["Type",      resourceDetails?.type?.replaceAll("_", " ") || "—"],
    ["Location",  resourceDetails?.location || "—"],
    ["Capacity",  resourceDetails?.capacity ? `${resourceDetails.capacity} people` : "—"],
  ];
  leftItems.forEach(([label, val]) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
    doc.text(label, 20, ly);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
    doc.text(String(val), 20, ly + 5);
    ly += 14;
  });

  // Right column: Booking Details
  doc.setFillColor(LIGHT);
  doc.roundedRect(106, y, 90, 80, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED);
  doc.text("BOOKING DETAILS", 112, y + 8);

  doc.setDrawColor(GOLD);
  doc.line(112, y + 10, 152, y + 10);

  let ry = y + 18;
  const rightItems = [
    ["Date",       booking.date],
    ["Time",       `${booking.startTime?.slice(0,5) || "—"} – ${booking.endTime?.slice(0,5) || "—"}`],
    ["Attendees",  booking.expectedAttendees],
    ["Purpose",    booking.purpose || "—"],
  ];
  rightItems.forEach(([label, val]) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
    doc.text(label, 112, ry);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
    // Wrap long text
    const lines = doc.splitTextToSize(String(val), 78);
    doc.text(lines, 112, ry + 5);
    ry += 14;
  });

  y += 88;

  // ── Requester info ──
  doc.setFillColor(LIGHT);
  doc.roundedRect(14, y, 182, 22, 2, 2, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(MUTED);
  doc.text("REQUESTED BY", 20, y + 7);
  doc.text("STATUS", 110, y + 7);
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(BRAND);
  doc.text(booking.userName || booking.userId || "—", 20, y + 15);

  // Status badge
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
  doc.setDrawColor("#f4b400");
  doc.setLineWidth(0.1);
  doc.roundedRect(14, y, 182, 24, 2, 2, "FD");
  doc.setTextColor("#854d0e");
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT", 20, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const note = "Please arrive 5 minutes before your booking time. Show this confirmation or your QR code at the venue for check-in verification. Cancellations must be made at least 1 hour before the booking start time.";
  const noteLines = doc.splitTextToSize(note, 170);
  doc.text(noteLines, 20, y + 14);
  y += 32;

  // ── Generated timestamp ──
  doc.setFontSize(8); doc.setTextColor(MUTED); doc.setFont("helvetica", "italic");
  doc.text(`This document was auto-generated on ${new Date().toLocaleString()} by the UniSphere Smart Campus system.`, 105, y, { align: "center" });

  addFooter(doc);

  // Save
  const fileName = `booking-confirmation-${booking.id?.slice(-6).toUpperCase() || "receipt"}.pdf`;
  doc.save(fileName);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADMIN — Booking Summary Report PDF
// ─────────────────────────────────────────────────────────────────────────────
export function downloadBookingSummaryReport(booking, resources) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = addHeader(doc, "Booking Summary Report");
  let page = 1;

  // ── Report title ──
  y += 4;
  doc.setTextColor("#424447");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Summary Report", 105, y, { align: "center" });
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(`Report generated: ${new Date().toLocaleString()}  |  Total records: ${booking.length}`, 105, y, { align: "center" });
  y += 8;

  // ── Summary stats row ──
  const statuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "CHECKED_IN"];
  const counts = {};
  statuses.forEach((s) => { counts[s] = booking.filter((b) => b.status === s).length; });
  const statColors = { PENDING: "#f59e0b", APPROVED: "#16a34a", REJECTED: "#dc2626", CANCELLED: "#94a3b8", CHECKED_IN: "#1d97b6" };

  const boxW = 34;
  const boxX = [14, 50, 86, 122, 158];
  statuses.forEach((s, i) => {
    doc.setFillColor(LIGHT);
    doc.setDrawColor(BORDER);
    doc.roundedRect(boxX[i], y, boxW, 20, 2, 2, "FD");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(statColors[s]);
    doc.text(String(counts[s]), boxX[i] + boxW / 2, y + 11, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(s.replace("_", " "), boxX[i] + boxW / 2, y + 17, { align: "center" });
  });
  y += 28;

  // ── Table header ──
  const cols = [
    { label: "Resource",   x: 14,  w: 48 },
    { label: "Booked by",  x: 64,  w: 38 },
    { label: "Date",       x: 104, w: 22 },
    { label: "Time",       x: 128, w: 24 },
    { label: "Attendees",  x: 154, w: 18 },
    { label: "Status",     x: 174, w: 22 },
  ];

  doc.setFillColor(BRAND);
  doc.rect(14, y, 182, 9, "F");
  cols.forEach((col) => {
    doc.setTextColor("#ffffff");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(col.label, col.x + 1, y + 6);
  });
  y += 9;

  // ── Table rows ──
  booking.forEach((booking, index) => {
    // Page break
    if (y > 268) {
      addFooter(doc, page);
      doc.addPage();
      page++;
      y = addHeader(doc, "Booking Summary Report — continued");
      y += 4;

      // Repeat header
      doc.setFillColor(BRAND);
      doc.rect(14, y, 182, 9, "F");
      cols.forEach((col) => {
        doc.setTextColor("#ffffff");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(col.label, col.x + 1, y + 6);
      });
      y += 9;
    }

    const resource = resources.find((r) => r.id === booking.resourceId);
    const rowBg = index % 2 === 0 ? "#ffffff" : LIGHT;
    doc.setFillColor(rowBg);
    doc.rect(14, y, 182, 8, "F");

    // Row border
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.2);
    doc.line(14, y + 8, 196, y + 8);

    const rowData = [
      { col: cols[0], val: resource?.name || booking.resourceId },
      { col: cols[1], val: booking.userName || booking.userId },
      { col: cols[2], val: booking.date },
      { col: cols[3], val: `${booking.startTime?.slice(0,5)||"?"} – ${booking.endTime?.slice(0,5)||"?"}` },
      { col: cols[4], val: String(booking.expectedAttendees) },
    ];

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    rowData.forEach(({ col, val }) => {
      doc.setTextColor(BRAND);
      const text = doc.splitTextToSize(val, col.w - 2);
      doc.text(text[0], col.x + 1, y + 5.5); // first line only in row
    });

    // Status badge
    const statusBg = statColors[booking.status] || MUTED;
    doc.setFillColor(statusBg);
    doc.roundedRect(cols[5].x, y + 1.5, cols[5].w, 5, 1, 1, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text((booking.status || "").replace("_", " "), cols[5].x + cols[5].w / 2, y + 5.5, { align: "center" });

    y += 8;
  });

  // ── Summary section at bottom ──
  if (y < 240) {
    y += 8;
    doc.setDrawColor(BORDER);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND);
    doc.text("Report Summary", 14, y);
    y += 6;

    // Most booked resource
    const resourceCounts = {};
    booking.forEach((b) => {
      const name = resources.find((r) => r.id === b.resourceId)?.name || b.resourceId;
      resourceCounts[name] = (resourceCounts[name] || 0) + 1;
    });
    const topResource = Object.entries(resourceCounts).sort((a, b) => b[1] - a[1])[0];

    const summaryRows = [
      ["Total bookings in report", String(booking.length)],
      ["Most booked resource", topResource ? `${topResource[0]} (${topResource[1]} booking)` : "N/A"],
      ["Approval rate", booking.length ? `${Math.round((counts.APPROVED / booking.length) * 100)}%` : "0%"],
      ["Check-in rate", counts.APPROVED ? `${Math.round((counts.CHECKED_IN / (counts.APPROVED + counts.CHECKED_IN || 1)) * 100)}%` : "0%"],
    ];

    summaryRows.forEach(([label, val]) => {
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
// ✅ Export generateBookingId so pages can import it
export function generateBookingId(booking, resourceType) {
  const typeMap = {
    LECTURE_HALL:    "HALL",
    SMART_CLASSROOM: "ROOM",
    CLASSROOM:       "ROOM",
    MEETING_ROOM:    "ROOM",
    SEMINAR_ROOM:    "ROOM",
    COMPUTER_LAB:    "LAB",
    SCIENCE_LAB:     "LAB",
    LABORATORY:      "LAB",
    EQUIPMENT:       "EQUIP",
    AV_ROOM:         "AV",
    AUDITORIUM:      "AUD",
  };
  const raw    = (resourceType || "RESOURCE").toUpperCase().replaceAll(" ", "_");
  const prefix = typeMap[raw] || raw.slice(0, 5);
  const hex    = (booking.id || "000000000000").slice(-10);
  const num    = parseInt(hex, 16) % 90000 + 10000;
  return `${prefix}#${num}`;
}
