package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for adding or editing a comment
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequestDTO {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}