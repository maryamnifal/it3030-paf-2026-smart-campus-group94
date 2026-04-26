import axios from "axios";

const BASE_URL = "http://localhost:8080/api/preferences";

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

// Get preferences for a user
export const getPreferences = async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`, getAuthHeader());
    return response.data;
};

// Update preferences
export const updatePreferences = async (userId, preferences) => {
    const response = await axios.put(`${BASE_URL}/${userId}`, preferences, getAuthHeader());
    return response.data;
};

// Reset preferences to default
export const resetPreferences = async (userId) => {
    const response = await axios.post(`${BASE_URL}/${userId}/reset`, {}, getAuthHeader());
    return response.data;
};