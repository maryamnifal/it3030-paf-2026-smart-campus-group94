package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.NotificationDTO;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    // Create a new notification (ADMIN manual)
    public Notification create(Notification notification) {
        // If source not set, default to ADMIN
        if (notification.getSource() == null) {
            notification.setSource("ADMIN");
        }
        return repository.save(notification);
    }

    // Get notifications for a specific user
    public List<Notification> getUserNotifications(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ADMIN - get all notifications
    public List<Notification> getAllNotifications() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    // Mark single notification as read
    public Notification markAsRead(String id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        return repository.save(notification);
    }

    // Mark all notifications as read for a user
    public void markAllAsRead(String userId) {
        List<Notification> notifications = repository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        repository.saveAll(notifications);
    }

    // ADMIN - update a notification (only ADMIN-created ones)
    public Notification update(String id, NotificationDTO dto) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        // Block editing system-generated notifications
        if ("SYSTEM".equals(notification.getSource())) {
            throw new RuntimeException("System-generated notifications cannot be edited.");
        }

        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        return repository.save(notification);
    }

    // Delete a notification
    public void delete(String id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        repository.delete(notification);
    }
}