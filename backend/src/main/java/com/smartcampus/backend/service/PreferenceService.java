package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.NotificationPreferenceDTO;
import com.smartcampus.backend.model.NotificationPreference;
import com.smartcampus.backend.repository.PreferenceRepository;
import org.springframework.stereotype.Service;

@Service
public class PreferenceService {

    private final PreferenceRepository repository;

    public PreferenceService(PreferenceRepository repository) {
        this.repository = repository;
    }

    // Get preferences for a user
    // If no preferences exist yet, create defaults
    public NotificationPreference getPreferences(String userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference defaults = new NotificationPreference(userId);
                    return repository.save(defaults);
                });
    }

    // Update preferences
    public NotificationPreference updatePreferences(String userId, NotificationPreferenceDTO dto) {
        NotificationPreference preference = repository.findByUserId(userId)
                .orElse(new NotificationPreference(userId));

        preference.setUserId(userId);
        preference.setBookingEnabled(dto.isBookingEnabled());
        preference.setAlertEnabled(dto.isAlertEnabled());
        preference.setUpdateEnabled(dto.isUpdateEnabled());
        preference.setSystemEnabled(dto.isSystemEnabled());
        preference.setResourceEnabled(dto.isResourceEnabled());

        return repository.save(preference);
    }

    // Reset all preferences to default (all ON)
    public NotificationPreference resetPreferences(String userId) {
        NotificationPreference preference = repository.findByUserId(userId)
                .orElse(new NotificationPreference(userId));

        preference.setUserId(userId);
        preference.setBookingEnabled(true);
        preference.setAlertEnabled(true);
        preference.setUpdateEnabled(true);
        preference.setSystemEnabled(true);
        preference.setResourceEnabled(true);

        return repository.save(preference);
    }

    // Check if a specific notification type is enabled for a user
    public boolean isTypeEnabled(String userId, String type) {
        NotificationPreference pref = repository.findByUserId(userId)
                .orElse(new NotificationPreference(userId));

        return switch (type.toUpperCase()) {
            case "BOOKING"  -> pref.isBookingEnabled();
            case "ALERT"    -> pref.isAlertEnabled();
            case "UPDATE"   -> pref.isUpdateEnabled();
            case "SYSTEM"   -> pref.isSystemEnabled();
            case "RESOURCE" -> pref.isResourceEnabled();
            default         -> true;
        };
    }
}