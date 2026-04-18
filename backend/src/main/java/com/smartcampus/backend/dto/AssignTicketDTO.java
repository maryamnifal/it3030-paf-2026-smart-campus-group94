package com.smartcampus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for assigning a technician to a ticket (Module C)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignTicketDTO {

    @NotBlank(message = "Technician ID is required")
    private String technicianId;

    @NotBlank(message = "Technician name is required")
    private String technicianName;

    @NotBlank(message = "Technician email is required")
    @Email(message = "Please provide a valid email address")
    private String technicianEmail;
}