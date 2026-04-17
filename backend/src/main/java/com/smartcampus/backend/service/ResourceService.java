package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // Create a new resource
    public Resource createResource(ResourceDTO dto) {
        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .status(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "ACTIVE")
                .description(dto.getDescription())
                .availabilityWindows(dto.getAvailabilityWindows())
                .imageUrl(dto.getImageUrl())
                .images(dto.getImages())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return resourceRepository.save(resource);
    }

    // Get all resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Get resource by ID
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    // Get resources by type
    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByTypeIgnoreCase(type);
    }

    // Get resources by location
    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location);
    }

    // Get resources by minimum capacity
    public List<Resource> getResourcesByCapacity(int capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }

    // Get filtered resources
    public List<Resource> getFilteredResources(String type, String location, Integer capacity) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(resource ->
                        type == null || type.isBlank() ||
                        (resource.getType() != null &&
                         resource.getType().toString().equalsIgnoreCase(type))
                )
                .filter(resource ->
                        location == null || location.isBlank() ||
                        (resource.getLocation() != null &&
                         resource.getLocation().toLowerCase().contains(location.toLowerCase()))
                )
                .filter(resource ->
                        capacity == null || resource.getCapacity() >= capacity
                )
                .toList();
    }

    // Update a resource
    public Resource updateResource(String id, ResourceDTO dto) {
        Resource existing = getResourceById(id);

        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setCapacity(dto.getCapacity());
        existing.setLocation(dto.getLocation());
        existing.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "ACTIVE");
        existing.setDescription(dto.getDescription());
        existing.setAvailabilityWindows(dto.getAvailabilityWindows());
        existing.setImageUrl(dto.getImageUrl());
        existing.setImages(dto.getImages());
        existing.setUpdatedAt(LocalDateTime.now());

        return resourceRepository.save(existing);
    }

    // Update resource status only
    public Resource updateResourceStatus(String id, String status) {
        Resource existing = getResourceById(id);
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existing);
    }

    // Delete a resource
    public void deleteResource(String id) {
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }
}