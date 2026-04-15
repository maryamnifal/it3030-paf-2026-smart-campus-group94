package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// NOTE TO TEAM: This class is embedded inside Ticket document (not a separate collection)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    private String id;          // unique comment ID (we'll generate manually)
    private String authorId;    // user ID of who wrote this comment
    private String authorName;  // display name of the author
    private String content;     // the actual comment text
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}