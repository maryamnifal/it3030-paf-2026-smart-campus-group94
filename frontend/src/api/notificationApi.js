import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

export const getNotificationsByUser = async (userId) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}`);
  return response.data;
};

export const createNotification = async (notificationData) => {
  const response = await axios.post(BASE_URL, notificationData);
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};