import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateAdminReportPdf(analytics) {
  const doc = new jsPDF();

  // Logo box
  doc.setFillColor(244, 180, 0);
  doc.roundedRect(14, 12, 12, 12, 2, 2, "F");

  // Logo letter
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("U", 18, 20);

  // Brand name
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Uni", 30, 20);

  doc.setTextColor(244, 180, 0);
  doc.text("Sphere", 40, 20);

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text("Admin Report", 14, 34);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value"]],
    body: [
      ["Total Resources", analytics.totalResources],
      ["Total Bookings", analytics.totalBookings],
      ["Pending Bookings", analytics.pendingBookings],
      ["Approved Bookings", analytics.approvedBookings],
      ["Rejected Bookings", analytics.rejectedBookings],
      ["Total Tickets", analytics.totalTickets],
      ["Open Tickets", analytics.openTickets],
      ["In Progress Tickets", analytics.inProgressTickets],
      ["Resolved Tickets", analytics.resolvedTickets],
      ["Closed Tickets", analytics.closedTickets],
      ["High Priority Tickets", analytics.highPriorityTickets],
    ],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Top Resource", "Type", "Bookings"]],
    body:
      analytics.topResources.length > 0
        ? analytics.topResources.map((r) => [
            r.resourceName,
            r.type,
            String(r.count),
          ])
        : [["No data", "-", "-"]],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Recent Booking", "Date", "Time", "Status"]],
    body:
      analytics.recentBookings.length > 0
        ? analytics.recentBookings.map((b) => [
            b.resourceName || "-",
            b.date || "-",
            `${String(b.startTime || "").slice(0, 5)} - ${String(
              b.endTime || ""
            ).slice(0, 5)}`,
            b.status || "-",
          ])
        : [["No recent bookings", "-", "-", "-"]],
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
  });

  doc.save("admin-report.pdf");
}