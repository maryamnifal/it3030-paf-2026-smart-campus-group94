import axios from "axios";

// NOTE TO TEAM: This API file handles all Module C (Maintenance & Incident Ticketing) endpoints
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================
// TICKET API CALLS
// =====================

// Create a new ticket
export const createTicket = (ticketData) =>
  api.post("/tickets", ticketData);

// Get all tickets - admin only (with optional filters)
export const getAllTickets = (status, priority) => {
  const params = {};
  if (status) params.status = status;
  if (priority) params.priority = priority;
  return api.get("/tickets", { params });
};

// Get my tickets - logged in user
export const getMyTickets = () =>
  api.get("/tickets/my");

// Get a single ticket by ID
export const getTicketById = (id) =>
  api.get(`/tickets/${id}`);

// Update ticket status - admin only
export const updateTicketStatus = (id, statusData) =>
  api.patch(`/tickets/${id}/status`, statusData);

// Assign technician to ticket - admin only
export const assignTechnician = (id, assignData) =>
  api.patch(`/tickets/${id}/assign`, assignData);

// Delete a ticket - admin only
export const deleteTicket = (id) =>
  api.delete(`/tickets/${id}`);

// =====================
// COMMENT API CALLS
// =====================

// Add a comment to a ticket
export const addComment = (ticketId, commentData) =>
  api.post(`/tickets/${ticketId}/comments`, commentData);

// Edit a comment
export const editComment = (ticketId, commentId, commentData) =>
  api.put(`/tickets/${ticketId}/comments/${commentId}`, commentData);

// Delete a comment
export const deleteComment = (ticketId, commentId) =>
  api.delete(`/tickets/${ticketId}/comments/${commentId}`);

// =====================
// ATTACHMENT API CALLS
// =====================

// Upload images to a ticket (max 3)
export const uploadAttachments = (ticketId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};