package com.smartcampus.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;        // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String status;      // ACTIVE, OUT_OF_SERVICE

    private String description;

    private List<String> availabilityWindows;

    // ✅ NEW FIELDS
    private String imageUrl;        // main image
    private List<String> images;    // gallery images
}