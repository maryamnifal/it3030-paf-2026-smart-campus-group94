package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for creating a new ticket - contains only what the client needs to send
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketRequestDTO {

   
    private String resourceId;      
    private String resourceName;    
    private String reporterType;

    @NotBlank(message = "Category is required")
    private String category;        // ELECTRICAL, EQUIPMENT, CLEANING, OTHER

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;        // LOW, MEDIUM, HIGH

    @NotBlank(message = "Contact details are required")
    private String contactDetails;
}