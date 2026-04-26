import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

// USER - get my notifications
export const getNotificationsByUser = async (userId) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`, getAuthHeader());
    return response.data;
};

// ADMIN - get all notifications
export const getAllNotifications = async () => {
    const response = await axios.get(`${BASE_URL}/all`, getAuthHeader());
    return response.data;
};

// ADMIN - create notification manually
export const createNotification = async (notificationData) => {
    const response = await axios.post(BASE_URL, notificationData, getAuthHeader());
    return response.data;
};

// ADMIN - update notification (only ADMIN-created)
export const updateNotification = async (id, notificationData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, notificationData, getAuthHeader());
    return response.data;
};

// USER - mark single as read
export const markNotificationAsRead = async (id) => {
    const response = await axios.patch(`${BASE_URL}/${id}/read`, {}, getAuthHeader());
    return response.data;
};

// USER - mark all as read
export const markAllNotificationsAsRead = async (userId) => {
    const response = await axios.patch(`${BASE_URL}/user/${userId}/read-all`, {}, getAuthHeader());
    return response.data;
};

// USER/ADMIN - delete
export const deleteNotification = async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`, getAuthHeader());
    return response.data;
};