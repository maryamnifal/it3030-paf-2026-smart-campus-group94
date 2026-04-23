package com.smartcampus.backend.dto;

public class StatusUpdateDTO {

    private String rejectionReason;
    private String approvalMessage; // ✅ NEW — optional message when approving

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getApprovalMessage() { return approvalMessage; }
    public void setApprovalMessage(String approvalMessage) { this.approvalMessage = approvalMessage; }
}