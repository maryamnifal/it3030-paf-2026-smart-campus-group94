import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const createBooking  = (data) => api.post("/bookings", data);
export const getMyBookings  = (userId) => api.get(`/bookings/my/${userId}`);
export const updateBooking  = (id, data) => api.put(`/bookings/${id}`, data);
export const getAllBookings  = () => api.get("/bookings");

// Slot availability — authenticated users (not admin-only)
export const getAvailability = (resourceId, date) =>
  api.get("/bookings/availability", { params: { resourceId, date } });

// ✅ Updated — sends optional approvalMessage to backend
export const approveBooking  = (id, approvalMessage = "") =>
  api.put(`/bookings/${id}/approve`, { approvalMessage });

export const rejectBooking   = (id, rejectionReason) =>
  api.put(`/bookings/${id}/reject`, { rejectionReason });

export const cancelBooking   = (id) => api.put(`/bookings/${id}/cancel`);
export const deleteBooking   = (id) => api.delete(`/bookings/${id}`);
export const checkInBooking  = (id) => api.put(`/bookings/${id}/checkin`);