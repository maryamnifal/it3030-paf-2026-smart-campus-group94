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
    
    private String resourceId;
    private String resourceName;    

    // Ticket details
    private String category;        
    private String description;     
    private String priority;        
    private String contactDetails;  
    private String reporterType; 

    
    // Admin can also set REJECTED with a reason
    private String status;

    // People involved
    private String createdBy;       
    private String createdByName;   
    private String assignedTo;      
    private String assignedToName;  

    // Resolution info
    private String resolutionNotes; // added when status → RESOLVED
    private String rejectionReason; // added when status → REJECTED

    // Attachments - max 3 image file paths/URLs
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    //Embedded list of Comment objects
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}