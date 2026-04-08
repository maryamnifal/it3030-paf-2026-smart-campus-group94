package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resources")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource {

    @Id
    private String id;

    private String name;
    private String type;         // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private int capacity;
    private String location;
    private String status;       // ACTIVE, OUT_OF_SERVICE
    private String description;
    private List<String> availabilityWindows;  // e.g. ["MON 08:00-18:00"]

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}