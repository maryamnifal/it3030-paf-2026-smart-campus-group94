package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    // POST - Create a new resource
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody ResourceDTO dto) {
        return new ResponseEntity<>(resourceService.createResource(dto), HttpStatus.CREATED);
    }

    // GET - Get all resources with optional filters
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacity) {

        if (type != null) return ResponseEntity.ok(resourceService.getResourcesByType(type));
        if (location != null) return ResponseEntity.ok(resourceService.getResourcesByLocation(location));
        if (capacity != null) return ResponseEntity.ok(resourceService.getResourcesByCapacity(capacity));
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET - Get single resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // PUT - Update a resource
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // PATCH - Update resource status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    // DELETE - Delete a resource
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}