package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for updating ticket status - used by admin/technician (Module C)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    private String status;          // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private String resolutionNotes; // required when status = RESOLVED
    private String rejectionReason; // required when status = REJECTED
}