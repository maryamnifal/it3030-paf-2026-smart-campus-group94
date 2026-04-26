package com.smartcampus.backend.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartcampus.backend.model.Ticket;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    // Send email to technician when assigned to a ticket
    public void sendTechnicianAssignmentEmail(String technicianEmail, String technicianName, Ticket ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(technicianEmail);
            helper.setSubject("UniSphere - New Ticket Assigned: #" + ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase());

            String htmlContent = buildAssignmentEmailHtml(technicianName, ticket);
            helper.setText(htmlContent, true);

            // Generate and attach PDF
            byte[] pdfBytes = generateTicketPdf(ticket);
            helper.addAttachment(
                "Ticket-" + ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase() + ".pdf",
                new ByteArrayDataSource(pdfBytes, "application/pdf")
            );

            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    // Send email to ticket creator when status changes
    public void sendStatusUpdateEmail(String creatorEmail, String creatorName, Ticket ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(creatorEmail);
            helper.setSubject("UniSphere - Ticket #" + ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase() + " Status Update: " + ticket.getStatus());

            String htmlContent = buildStatusUpdateEmailHtml(creatorName, ticket);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
    }

    private byte[] generateTicketPdf(Ticket ticket) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            Paragraph header = new Paragraph("UniSphere — Smart Campus Operations Hub")
                    .setFontSize(16)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("Incident Ticket Report")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(subHeader);

            document.add(new Paragraph(" "));

            // Ticket ID
            document.add(new Paragraph("Ticket #" + ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase())
                    .setFontSize(14).setBold());

            document.add(new Paragraph(" "));

            // Details table
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2})).useAllAvailableWidth();

            addTableRow(table, "Status", ticket.getStatus());
            addTableRow(table, "Priority", ticket.getPriority());
            addTableRow(table, "Category", ticket.getCategory());
            addTableRow(table, "Location / Resource", ticket.getResourceName() != null ? ticket.getResourceName() : "N/A");
            //addTableRow(table, "Reporter Type", ticket.getReporterType() != null ? ticket.getReporterType() : "N/A");
            addTableRow(table, "Reported By", ticket.getCreatedByName() != null ? ticket.getCreatedByName() : "N/A");
            addTableRow(table, "Contact Details", ticket.getContactDetails() != null ? ticket.getContactDetails() : "N/A");
            addTableRow(table, "Assigned To", ticket.getAssignedToName() != null ? ticket.getAssignedToName() : "Unassigned");
            addTableRow(table, "Created At", ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A");

            document.add(table);

            document.add(new Paragraph(" "));

            // Description
            document.add(new Paragraph("Description:").setBold());
            document.add(new Paragraph(ticket.getDescription() != null ? ticket.getDescription() : "N/A"));

            // Resolution Notes
            if (ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Resolution Notes:").setBold());
                document.add(new Paragraph(ticket.getResolutionNotes()));
            }

            // Comments
            if (ticket.getComments() != null && !ticket.getComments().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Comments (" + ticket.getComments().size() + "):").setBold());
                for (int i = 0; i < ticket.getComments().size(); i++) {
                    var comment = ticket.getComments().get(i);
                    document.add(new Paragraph((i + 1) + ". " + comment.getAuthorName() + ": " + comment.getContent()));
                }
            }

            // Footer
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Generated by UniSphere · SLIIT IT3030 · Group 94")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();

        } catch (Exception e) {
            System.err.println("Failed to generate PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY));
        table.addCell(new Cell().add(new Paragraph(value)));
    }

    private String buildAssignmentEmailHtml(String technicianName, Ticket ticket) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                        .header { background: linear-gradient(90deg, #0b1220, #1a2540); padding: 30px; text-align: center; }
                        .header h1 { color: #f4b400; margin: 0; font-size: 24px; }
                        .header p { color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px; }
                        .body { padding: 32px; }
                        .greeting { font-size: 16px; color: #0f172a; margin-bottom: 20px; }
                        .ticket-card { background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
                        .field { margin-bottom: 14px; }
                        .field-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
                        .field-value { font-size: 14px; color: #0f172a; font-weight: 600; }
                        .priority-HIGH { color: #991b1b; background: #fee2e2; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .priority-MEDIUM { color: #854d0e; background: #fef9c3; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .priority-LOW { color: #166534; background: #dcfce7; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(15,23,42,0.06); }
                        .note { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #0369a1; margin-top: 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>UniSphere</h1>
                            <p>Smart Campus Operations Hub</p>
                        </div>
                        <div class="body">
                            <div class="greeting">
                                Hi <strong>%s</strong>,<br><br>
                                You have been assigned to a new incident ticket. Please review the attached PDF for full details and take action as soon as possible.
                            </div>
                            <div class="ticket-card">
                                <div class="field">
                                    <div class="field-label">Ticket ID</div>
                                    <div class="field-value">#%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Category</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Priority</div>
                                    <div class="field-value"><span class="priority-%s">%s</span></div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Location / Resource</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Reporter Type</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Reported By</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Description</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Reporter Contact</div>
                                    <div class="field-value">%s</div>
                                </div>
                            </div>
                            <div class="note">
                                📎 A full PDF report of this ticket is attached to this email for your reference.
                            </div>
                        </div>
                        <div class="footer">
                            © 2026 UniSphere · SLIIT IT3030 · Group 94<br>
                            This is an automated notification. Please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                technicianName,
                ticket.getId() != null ? ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase() : "N/A",
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getPriority(),
                ticket.getResourceName() != null ? ticket.getResourceName() : "N/A",
                //ticket.getReporterType() != null ? ticket.getReporterType() : "N/A",
                ticket.getCreatedByName() != null ? ticket.getCreatedByName() : "N/A",
                ticket.getDescription(),
                ticket.getContactDetails() != null ? ticket.getContactDetails() : "N/A"
        );
    }

    private String buildStatusUpdateEmailHtml(String creatorName, Ticket ticket) {
        String statusColor = switch (ticket.getStatus()) {
            case "IN_PROGRESS" -> "#854d0e";
            case "RESOLVED" -> "#166534";
            case "CLOSED" -> "#475569";
            case "REJECTED" -> "#9d174d";
            default -> "#1e40af";
        };

        String statusBg = switch (ticket.getStatus()) {
            case "IN_PROGRESS" -> "#fef9c3";
            case "RESOLVED" -> "#dcfce7";
            case "CLOSED" -> "#f1f5f9";
            case "REJECTED" -> "#fce7f3";
            default -> "#dbeafe";
        };

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                        .header { background: linear-gradient(90deg, #0b1220, #1a2540); padding: 30px; text-align: center; }
                        .header h1 { color: #f4b400; margin: 0; font-size: 24px; }
                        .header p { color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px; }
                        .body { padding: 32px; }
                        .status-badge { padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; display: inline-block; margin: 12px 0; }
                        .ticket-card { background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; padding: 20px; margin: 20px 0; }
                        .field { margin-bottom: 12px; }
                        .field-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
                        .field-value { font-size: 14px; color: #0f172a; font-weight: 600; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(15,23,42,0.06); }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>UniSphere</h1>
                            <p>Smart Campus Operations Hub</p>
                        </div>
                        <div class="body">
                            <p style="font-size: 16px; color: #0f172a;">Hi <strong>%s</strong>,</p>
                            <p style="color: #475569;">Your incident ticket status has been updated.</p>
                            <div class="status-badge" style="background: %s; color: %s;">%s</div>
                            <div class="ticket-card">
                                <div class="field">
                                    <div class="field-label">Ticket ID</div>
                                    <div class="field-value">#%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Category</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Location / Resource</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Description</div>
                                    <div class="field-value">%s</div>
                                </div>
                                %s
                            </div>
                        </div>
                        <div class="footer">
                            © 2026 UniSphere · SLIIT IT3030 · Group 94<br>
                            This is an automated notification. Please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                creatorName,
                statusBg,
                statusColor,
                ticket.getStatus().replace("_", " "),
                ticket.getId() != null ? ticket.getId().substring(Math.max(0, ticket.getId().length() - 6)).toUpperCase() : "N/A",
                ticket.getCategory(),
                ticket.getResourceName() != null ? ticket.getResourceName() : "N/A",
                ticket.getDescription(),
                ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isEmpty()
                        ? "<div class='field'><div class='field-label'>Resolution Notes</div><div class='field-value'>" + ticket.getResolutionNotes() + "</div></div>"
                        : ticket.getRejectionReason() != null && !ticket.getRejectionReason().isEmpty()
                        ? "<div class='field'><div class='field-label'>Rejection Reason</div><div class='field-value'>" + ticket.getRejectionReason() + "</div></div>"
                        : ""
        );
    }
}