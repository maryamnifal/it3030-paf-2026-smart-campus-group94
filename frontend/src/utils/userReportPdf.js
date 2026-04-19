import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateUserReportPdf(analytics, userName = "User") {
  const doc = new jsPDF();

  // Draw UniSphere logo manually
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

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("User Dashboard Report", 14, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 44);
  doc.text(`User: ${userName}`, 14, 50);

  autoTable(doc, {
    startY: 58,
    head: [["Metric", "Value"]],
    body: [
      ["My Bookings", analytics.totalBookings],
      ["Pending Bookings", analytics.pendingBookings],
      ["Approved Bookings", analytics.approvedBookings],
      ["Rejected Bookings", analytics.rejectedBookings],
      ["My Tickets", analytics.totalTickets],
      ["Open Tickets", analytics.openTickets],
      ["In Progress Tickets", analytics.inProgressTickets],
      ["Resolved Tickets", analytics.resolvedTickets],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Recent Booking", "Date", "Time", "Status"]],
    body:
      analytics.recentBookings.length > 0
        ? analytics.recentBookings.map((b) => [
            b.resourceName || "Unknown Resource",
            b.date || "-",
            `${String(b.startTime || "").slice(0, 5)} - ${String(
              b.endTime || ""
            ).slice(0, 5)}`,
            b.status || "-",
          ])
        : [["No recent bookings", "-", "-", "-"]],
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [22, 58, 99],
      textColor: [255, 255, 255],
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Recent Incident", "Category", "Priority", "Status"]],
    body:
      analytics.recentTickets.length > 0
        ? analytics.recentTickets.map((t) => [
            t.resourceName || "Unknown Resource",
            t.category || "-",
            t.priority || "-",
            t.status || "-",
          ])
        : [["No recent incidents", "-", "-", "-"]],
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [75, 101, 132],
      textColor: [255, 255, 255],
    },
  });

  doc.save("user-report.pdf");
}