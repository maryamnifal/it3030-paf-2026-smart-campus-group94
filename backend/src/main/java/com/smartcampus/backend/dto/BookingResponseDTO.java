package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class BookingResponseDTO {

    private String id;
    private String resourceId;
    private String userId;
    private String userName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private String approvalMessage; // ✅ NEW
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(int expectedAttendees) { this.expectedAttendees = expectedAttendees; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    // ✅ NEW
    public String getApprovalMessage() { return approvalMessage; }
    public void setApprovalMessage(String approvalMessage) { this.approvalMessage = approvalMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}