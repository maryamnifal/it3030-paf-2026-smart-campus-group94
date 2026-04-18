package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
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

// NOTE TO TEAM: This service handles all Module C (Maintenance & Incident Ticketing) business logic
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EmailService emailService;

    // Directory where uploaded images will be stored
    private final String UPLOAD_DIR = "uploads/tickets/";

    // =====================
    // VALID STATUS TRANSITIONS
   
    // OPEN → IN_PROGRESS → RESOLVED → CLOSED
    // Any status → REJECTED (admin only)
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        if (newStatus.equals("REJECTED")) return true; // admin can reject anytime

        return switch (currentStatus) {
            case "OPEN" -> newStatus.equals("IN_PROGRESS");
            case "IN_PROGRESS" -> newStatus.equals("RESOLVED");
            case "RESOLVED" -> newStatus.equals("CLOSED");
            default -> false; // CLOSED and REJECTED are terminal states
        };
    }

    // =====================
    // TICKET CRUD

    // Create a new ticket
    public TicketResponseDTO createTicket(TicketRequestDTO request, String userId, String userName) {
        Ticket ticket = Ticket.builder()
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .category(request.getCategory().toUpperCase())
                .description(request.getDescription())
                .priority(request.getPriority().toUpperCase())
                .status("OPEN")             // always starts as OPEN
                .contactDetails(request.getContactDetails())
                .createdBy(userId)
                .createdByName(userName)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    // Get all tickets (admin only)
    public List<TicketResponseDTO> getAllTickets(String status, String priority) {
        List<Ticket> tickets;

        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriority(status.toUpperCase(), priority.toUpperCase());
        } else if (status != null) {
            tickets = ticketRepository.findByStatus(status.toUpperCase());
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(priority.toUpperCase());
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Get tickets created by a specific user
    public List<TicketResponseDTO> getMyTickets(String userId) {
        return ticketRepository.findByCreatedBy(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get a single ticket by ID
    public TicketResponseDTO getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        return mapToResponse(ticket);
    }

    // Update ticket status (admin)
    public TicketResponseDTO updateTicketStatus(String ticketId, TicketStatusUpdateDTO request, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        String newStatus = request.getStatus().toUpperCase();

        // Validate status transition
        if (!isValidStatusTransition(ticket.getStatus(), newStatus)) {
            throw new RuntimeException(
                "Invalid status transition from " + ticket.getStatus() + " to " + newStatus
            );
        }

        // Validate resolution notes when resolving
        if (newStatus.equals("RESOLVED") && (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank())) {
            throw new RuntimeException("Resolution notes are required when resolving a ticket");
        }

        // Validate rejection reason when rejecting
        if (newStatus.equals("REJECTED") && (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
            throw new RuntimeException("Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (newStatus.equals("RESOLVED")) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (newStatus.equals("REJECTED")) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    // Assign technician to ticket (admin only)
    public TicketResponseDTO assignTechnician(String ticketId, AssignTicketDTO request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setAssignedTo(request.getTechnicianId());
        ticket.setAssignedToName(request.getTechnicianName());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // Send email notification to technician
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

    // Delete ticket (admin only)
    public void deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        ticketRepository.deleteById(ticketId);
    }

    // =====================
    // COMMENTS
    // =====================

    // Add a comment to a ticket
    public TicketResponseDTO addComment(String ticketId, CommentRequestDTO request, String userId, String userName) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())   // generate unique ID for the comment
                .authorId(userId)
                .authorName(userName)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // Edit a comment (only the author can edit)
    public TicketResponseDTO editComment(String ticketId, String commentId, CommentRequestDTO request, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Only the author can edit (admin cannot edit others' comments, only delete)
        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // Delete a comment (author or admin can delete)
    public TicketResponseDTO deleteComment(String ticketId, String commentId, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Admin can delete any comment, user can only delete their own
        if (!isAdmin && !comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(ticketRepository.save(ticket));
    }

    // =====================
    // ATTACHMENTS
    // =====================

    // Upload images to a ticket (max 3)
    public TicketResponseDTO uploadAttachments(String ticketId, List<MultipartFile> files, String userId) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // Check ownership - only the creator can add attachments
        if (!ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("You can only add attachments to your own tickets");
        }

        // Check max 3 attachments rule
        int currentCount = ticket.getAttachments().size();
        if (currentCount + files.size() > 3) {
            throw new RuntimeException(
                "Maximum 3 attachments allowed. You already have " + currentCount + " attachment(s)."
            );
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save each file
        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            ticket.getAttachments().add(filename);
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(ticketRepository.save(ticket));
    }

    // =====================
    // HELPER - Map Ticket to TicketResponseDTO
    // =====================
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