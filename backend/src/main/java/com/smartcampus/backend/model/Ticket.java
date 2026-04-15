package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// NOTE TO TEAM: MongoDB collection name is "tickets"
// If your module uses a different collection name, update it here
@Document(collection = "tickets")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Ticket {

    @Id
    private String id;

    // Which resource/location this ticket is about
    // NOTE TO TEAM: This references the resource ID from the "resources" collection (Module A)
    private String resourceId;
    private String resourceName;    // stored for display purposes

    // Ticket details
    private String category;        // e.g. ELECTRICAL, EQUIPMENT, CLEANING, OTHER
    private String description;     // full description of the problem
    private String priority;        // LOW, MEDIUM, HIGH
    private String contactDetails;  // preferred contact of the reporter

    // Ticket status - follows workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
    // Admin can also set REJECTED with a reason
    private String status;

    // People involved
    private String createdBy;       // user ID of ticket creator
    private String createdByName;   // display name of creator
    private String assignedTo;      // user ID of assigned technician
    private String assignedToName;  // display name of technician

    // Resolution info
    private String resolutionNotes; // added when status → RESOLVED
    private String rejectionReason; // added when status → REJECTED

    // Attachments - max 3 image file paths/URLs
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    // Comments - embedded list of Comment objects
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}