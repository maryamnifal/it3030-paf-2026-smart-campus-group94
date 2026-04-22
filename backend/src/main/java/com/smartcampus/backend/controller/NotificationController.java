package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.NotificationDTO;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // ADMIN - Create a notification manually
    @PostMapping
    public ResponseEntity<Notification> create(@Valid @RequestBody NotificationDTO dto) {
        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setSource("ADMIN"); // always ADMIN for manual creation

        Notification saved = service.create(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // USER - Get notifications for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserNotifications(userId));
    }

    // ADMIN - Get all notifications
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(service.getAllNotifications());
    }

    // USER - Mark a single notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(service.markAsRead(id));
    }

    // USER - Mark all notifications as read
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        service.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN - Update a notification (only ADMIN-created)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @Valid @RequestBody NotificationDTO dto) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // USER/ADMIN - Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}