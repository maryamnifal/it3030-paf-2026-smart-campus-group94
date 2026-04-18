package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

// NOTE TO TEAM: This service handles email notifications for Module C (Incident Ticketing)
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

            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
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
                        .ticket-id { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
                        .field { margin-bottom: 14px; }
                        .field-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
                        .field-value { font-size: 14px; color: #0f172a; font-weight: 600; }
                        .priority-high { color: #991b1b; background: #fee2e2; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .priority-medium { color: #854d0e; background: #fef9c3; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .priority-low { color: #166534; background: #dcfce7; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-block; }
                        .cta { background: #f4b400; color: #111827; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; margin-top: 8px; }
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
                            <div class="greeting">
                                Hi <strong>%s</strong>,<br><br>
                                You have been assigned to a new incident ticket. Please review the details below and take action as soon as possible.
                            </div>
                            <div class="ticket-card">
                                <div class="ticket-id">Ticket #%s</div>
                                <div class="field">
                                    <div class="field-label">Category</div>
                                    <div class="field-value">%s</div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Priority</div>
                                    <div class="field-value"><span class="%s">%s</span></div>
                                </div>
                                <div class="field">
                                    <div class="field-label">Location / Resource</div>
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
                            <p style="color: #64748b; font-size: 14px;">Please log in to UniSphere to update the ticket status and add resolution notes.</p>
                            <a href="http://localhost:5173/incidents" class="cta">View Ticket →</a>
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
                "priority-" + ticket.getPriority().toLowerCase(),
                ticket.getPriority(),
                ticket.getResourceName() != null ? ticket.getResourceName() : "N/A",
                ticket.getDescription(),
                ticket.getContactDetails()
        );
    }
}