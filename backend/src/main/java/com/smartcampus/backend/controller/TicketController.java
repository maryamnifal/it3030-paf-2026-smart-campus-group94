package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

// NOTE TO TEAM: This controller handles all Module C (Maintenance & Incident Ticketing) endpoints
// Base URL: /api/tickets
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    // Helper method to get current logged in user from JWT token
    private User getCurrentUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =====================
    // TICKET ENDPOINTS
    // =====================

    // POST /api/tickets
    // Create a new ticket (USER + ADMIN)
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        TicketResponseDTO response = ticketService.createTicket(request, user.getId(), user.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/tickets
    // Get all tickets with optional filters (ADMIN only)
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {

        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    // GET /api/tickets/my
    // Get tickets created by the logged in user (USER + ADMIN)
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    // GET /api/tickets/{id}
    // Get a single ticket by ID (USER + ADMIN)
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PATCH /api/tickets/{id}/status
    // Update ticket status (ADMIN only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateDTO request,
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, user.getId()));
    }

    // PATCH /api/tickets/{id}/assign
    // Assign a technician to a ticket (ADMIN only)
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody AssignTicketDTO request) {

        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    // DELETE /api/tickets/{id}
    // Delete a ticket (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // =====================
    // COMMENT ENDPOINTS
    // =====================

    // POST /api/tickets/{id}/comments
    // Add a comment to a ticket (USER + ADMIN)
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponseDTO> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequestDTO request,
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, request, user.getId(), user.getName()));
    }

    // PUT /api/tickets/{id}/comments/{commentId}
    // Edit a comment (only the author can edit)
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketResponseDTO> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequestDTO request,
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        return ResponseEntity.ok(ticketService.editComment(id, commentId, request, user.getId(), isAdmin));
    }

    // DELETE /api/tickets/{id}/comments/{commentId}
    // Delete a comment (author or admin)
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader("X-User-Email") String userEmail) {

        User user = getCurrentUser(userEmail);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        ticketService.deleteComment(id, commentId, user.getId(), isAdmin);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // =====================
    // ATTACHMENT ENDPOINTS
    // =====================

    // POST /api/tickets/{id}/attachments
    // Upload images to a ticket (max 3) (USER + ADMIN)
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestHeader("X-User-Email") String userEmail) throws IOException {

        User user = getCurrentUser(userEmail);
        return ResponseEntity.ok(ticketService.uploadAttachments(id, files, user.getId()));
    }
}