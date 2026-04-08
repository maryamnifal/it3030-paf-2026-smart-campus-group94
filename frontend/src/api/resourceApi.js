import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Get all resources with optional filters
export const getAllResources = (filters = {}) => {
    return api.get('/resources', { params: filters });
};

// Get single resource by ID
export const getResourceById = (id) => {
    return api.get(`/resources/${id}`);
};

// Create a new resource
export const createResource = (data) => {
    return api.post('/resources', data);
};

// Update a resource
export const updateResource = (id, data) => {
    return api.put(`/resources/${id}`, data);
};

// Update resource status
export const updateResourceStatus = (id, status) => {
    return api.patch(`/resources/${id}/status?status=${status}`);
};

// Delete a resource
export const deleteResource = (id) => {
    return api.delete(`/resources/${id}`);
};