package com.smartcampus.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    private String userId;

    // Preference toggles
    private boolean bookingEnabled;
    private boolean alertEnabled;
    private boolean updateEnabled;
    private boolean systemEnabled;
    private boolean resourceEnabled;

    // Default constructor — everything ON by default
    public NotificationPreference() {
        this.bookingEnabled  = true;
        this.alertEnabled    = true;
        this.updateEnabled   = true;
        this.systemEnabled   = true;
        this.resourceEnabled = true;
    }

    // Constructor with userId
    public NotificationPreference(String userId) {
        this.userId          = userId;
        this.bookingEnabled  = true;
        this.alertEnabled    = true;
        this.updateEnabled   = true;
        this.systemEnabled   = true;
        this.resourceEnabled = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(boolean bookingEnabled) { this.bookingEnabled = bookingEnabled; }

    public boolean isAlertEnabled() { return alertEnabled; }
    public void setAlertEnabled(boolean alertEnabled) { this.alertEnabled = alertEnabled; }

    public boolean isUpdateEnabled() { return updateEnabled; }
    public void setUpdateEnabled(boolean updateEnabled) { this.updateEnabled = updateEnabled; }

    public boolean isSystemEnabled() { return systemEnabled; }
    public void setSystemEnabled(boolean systemEnabled) { this.systemEnabled = systemEnabled; }

    public boolean isResourceEnabled() { return resourceEnabled; }
    public void setResourceEnabled(boolean resourceEnabled) { this.resourceEnabled = resourceEnabled; }
}