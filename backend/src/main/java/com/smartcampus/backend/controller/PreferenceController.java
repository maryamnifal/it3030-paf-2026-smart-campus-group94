package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.NotificationPreferenceDTO;
import com.smartcampus.backend.model.NotificationPreference;
import com.smartcampus.backend.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PreferenceController {

    private final PreferenceService service;

    public PreferenceController(PreferenceService service) {
        this.service = service;
    }

    // GET preferences for a user
    @GetMapping("/{userId}")
    public ResponseEntity<NotificationPreference> getPreferences(
            @PathVariable String userId) {
        return ResponseEntity.ok(service.getPreferences(userId));
    }

    // PUT update preferences
    @PutMapping("/{userId}")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @PathVariable String userId,
            @RequestBody NotificationPreferenceDTO dto) {
        return ResponseEntity.ok(service.updatePreferences(userId, dto));
    }

    // POST reset to defaults
    @PostMapping("/{userId}/reset")
    public ResponseEntity<NotificationPreference> resetPreferences(
            @PathVariable String userId) {
        return ResponseEntity.ok(service.resetPreferences(userId));
    }
}