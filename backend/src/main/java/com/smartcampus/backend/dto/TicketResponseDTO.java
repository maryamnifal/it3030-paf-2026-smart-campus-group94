package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// DTO for sending ticket data back to the client
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketResponseDTO {

    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceLocation;
    private String resourceType;
    private String category;
    private String description;
    private String priority;
    private String status;
    private String contactDetails;
    private String reporterType;
    private String createdBy;
    private String createdByName;
    private String assignedTo;
    private String assignedToName;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> attachments;
    private List<CommentResponseDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}