import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const createBooking = (data) => api.post("/bookings", data);

export const getMyBookings = (userId) => api.get(`/bookings/my/${userId}`);

export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);

export const getAllBookings = () => api.get("/bookings");

// ✅ FIXED: Dedicated availability endpoint — authenticated users (not admin-only)
// Previously TimeSlotSelector called getAllBookings() which is admin-only → 401 error
// → catch block silently set bookings=[] → all slots appeared available → double booking allowed
export const getAvailability = (resourceId, date) =>
  api.get("/bookings/availability", { params: { resourceId, date } });

export const approveBooking = (id) => api.put(`/bookings/${id}/approve`);

export const rejectBooking = (id, rejectionReason) =>
  api.put(`/bookings/${id}/reject`, { rejectionReason });

export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

// ✅ NEW: Mark booking as CHECKED_IN from admin verify screen
export const checkInBooking  = (id) => api.put(`/bookings/${id}/checkin`);