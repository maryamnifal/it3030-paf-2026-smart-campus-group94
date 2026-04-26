package com.smartcampus.backend.dto;

public class NotificationPreferenceDTO {

    private boolean bookingEnabled;
    private boolean alertEnabled;
    private boolean updateEnabled;
    private boolean systemEnabled;
    private boolean resourceEnabled;

    public NotificationPreferenceDTO() {}

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