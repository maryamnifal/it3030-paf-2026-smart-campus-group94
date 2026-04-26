package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public TicketService(TicketRepository ticketRepository,
                         EmailService emailService,
                         NotificationRepository notificationRepository) {
        this.ticketRepository = ticketRepository;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    private final String UPLOAD_DIR = "uploads/tickets/";

    //NOTIFICATION HELPER 
    private void sendNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSource("SYSTEM");
        notificationRepository.save(notification);
    }

    // STATUS TRANSITION VALIDATOR
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        if (newStatus.equals("REJECTED")) return true;
        return switch (currentStatus) {
            case "OPEN"        -> newStatus.equals("IN_PROGRESS");
            case "IN_PROGRESS" -> newStatus.equals("RESOLVED");
            case "RESOLVED"    -> newStatus.equals("CLOSED");
            default            -> false;
        };
    }

    // CREATE TICKET 
    public TicketResponseDTO createTicket(TicketRequestDTO request, String userId, String userName) {
        Ticket ticket = Ticket.builder()
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .category(request.getCategory().toUpperCase())
                .description(request.getDescription())
                .priority(request.getPriority().toUpperCase())
                .status("OPEN")
                .contactDetails(request.getContactDetails())
                .reporterType(request.getReporterType())
                .createdBy(userId)
                .createdByName(userName)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Notify user ticket was created
        sendNotification(
            userId,
            "Ticket Created 🎫",
            "Your maintenance ticket for '" + request.getResourceName() +
            "' has been submitted successfully. We'll get back to you soon.",
            "ALERT"
        );

        return mapToResponse(saved);
    }

    // GET ALL TICKETS (ADMIN) 
    public List<TicketResponseDTO> getAllTickets(String status, String priority) {
        List<Ticket> tickets;

        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriority(
                status.toUpperCase(), priority.toUpperCase());
        } else if (status != null) {
            tickets = ticketRepository.findByStatus(status.toUpperCase());
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(priority.toUpperCase());
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // GET MY TICKETS
    public List<TicketResponseDTO> getMyTickets(String userId) {
        return ticketRepository.findByCreatedBy(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // GET TICKET BY ID
    public TicketResponseDTO getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        return mapToResponse(ticket);
    }

    //UPDATE TICKET STATUS 
    public TicketResponseDTO updateTicketStatus(String ticketId, TicketStatusUpdateDTO request, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        String newStatus = request.getStatus().toUpperCase();

        if (!isValidStatusTransition(ticket.getStatus(), newStatus)) {
            throw new RuntimeException(
                "Invalid status transition from " + ticket.getStatus() + " to " + newStatus);
        }

        if (newStatus.equals("RESOLVED") &&
                (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank())) {
            throw new RuntimeException("Resolution notes are required when resolving a ticket");
        }

        if (newStatus.equals("REJECTED") &&
                (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
            throw new RuntimeException("Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (newStatus.equals("RESOLVED")) ticket.setResolutionNotes(request.getResolutionNotes());
        if (newStatus.equals("REJECTED")) ticket.setRejectionReason(request.getRejectionReason());

        Ticket saved = ticketRepository.save(ticket);

        //Notify user based on new status
        switch (newStatus) {
            case "IN_PROGRESS" -> sendNotification(
                ticket.getCreatedBy(),
                "Ticket In Progress 🔧",
                "Your ticket for '" + ticket.getResourceName() +
                "' is now being worked on by our team.",
                "ALERT"
            );
            case "RESOLVED" -> sendNotification(
                ticket.getCreatedBy(),
                "Ticket Resolved ✅",
                "Your ticket for '" + ticket.getResourceName() +
                "' has been resolved. Notes: " + request.getResolutionNotes(),
                "ALERT"
            );
            case "CLOSED" -> sendNotification(
                ticket.getCreatedBy(),
                "Ticket Closed 🔒",
                "Your ticket for '" + ticket.getResourceName() +
                "' has been closed. Thank you!",
                "ALERT"
            );
            case "REJECTED" -> sendNotification(
                ticket.getCreatedBy(),
                "Ticket Rejected ❌",
                "Your ticket for '" + ticket.getResourceName() +
                "' was rejected. Reason: " + request.getRejectionReason(),
                "ALERT"
            );
        }

        return mapToResponse(saved);
    }

    // ASSIGN TECHNICIAN 
    public TicketResponseDTO assignTechnician(String ticketId, AssignTicketDTO request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setAssignedTo(request.getTechnicianId());
        ticket.setAssignedToName(request.getTechnicianName());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // 🔔 Notify ticket creator technician was assigned
        sendNotification(
            ticket.getCreatedBy(),
            "Technician Assigned 👷",
            "A technician (" + request.getTechnicianName() +
            ") has been assigned to your ticket for '" + ticket.getResourceName() + "'.",
            "UPDATE"
        );

        // Send email to technician
        try {
            emailService.sendTechnicianAssignmentEmail(
                request.getTechnicianEmail(),
                request.getTechnicianName(),
                saved
            );
        } catch (Exception e) {
            System.err.println("Email notification failed: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    // DELETE TICKET 
    public void deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        ticketRepository.deleteById(ticketId);
    }

    //ADD COMMENT 
    public TicketResponseDTO addComment(String ticketId, CommentRequestDTO request,
                                        String userId, String userName) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .authorId(userId)
                .authorName(userName)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // Notify ticket owner if someone else commented
        if (!ticket.getCreatedBy().equals(userId)) {
            sendNotification(
                ticket.getCreatedBy(),
                "New Comment on Your Ticket 💬",
                userName + " commented on your ticket for '" +
                ticket.getResourceName() + "': \"" + request.getContent() + "\"",
                "UPDATE"
            );
        }

        return mapToResponse(saved);
    }

    // EDIT COMMENT
    public TicketResponseDTO editComment(String ticketId, String commentId,
                                         CommentRequestDTO request, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── DELETE COMMENT ───────────────────────────────────────────────────
    public TicketResponseDTO deleteComment(String ticketId, String commentId,
                                           String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if (!isAdmin && !comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── UPLOAD ATTACHMENTS ───────────────────────────────────────────────
    public TicketResponseDTO uploadAttachments(String ticketId, List<MultipartFile> files,
                                               String userId) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("You can only add attachments to your own tickets");
        }

        int currentCount = ticket.getAttachments().size();
        if (currentCount + files.size() > 3) {
            throw new RuntimeException(
                "Maximum 3 attachments allowed. You already have " + currentCount + " attachment(s).");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            ticket.getAttachments().add(filename);
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(ticketRepository.save(ticket));
    }

    // MAPPER 
    private TicketResponseDTO mapToResponse(Ticket ticket) {
        List<CommentResponseDTO> commentDTOs = ticket.getComments().stream()
                .map(c -> CommentResponseDTO.builder()
                        .id(c.getId())
                        .authorId(c.getAuthorId())
                        .authorName(c.getAuthorName())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResourceId())
                .resourceName(ticket.getResourceName())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .reporterType(ticket.getReporterType())
                .createdBy(ticket.getCreatedBy())
                .createdByName(ticket.getCreatedByName())
                .assignedTo(ticket.getAssignedTo())
                .assignedToName(ticket.getAssignedToName())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachments(ticket.getAttachments())
                .comments(commentDTOs)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}