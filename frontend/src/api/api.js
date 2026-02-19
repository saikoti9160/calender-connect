import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
    getMe: () => api.get('/users/me'),
    updateProfile: (data) => api.put('/users/me', data),
    getByUsername: (username) => api.get(`/users/${username}`),
};

// Event Types API
export const eventTypeAPI = {
    getAll: () => api.get('/event-types'),
    create: (data) => api.post('/event-types', data),
    update: (id, data) => api.put(`/event-types/${id}`, data),
    toggle: (id) => api.patch(`/event-types/${id}/toggle`),
    delete: (id) => api.delete(`/event-types/${id}`),
};

// Availability API
export const availabilityAPI = {
    getMyAvailability: () => api.get('/availability'),
    saveAvailability: (data) => api.post('/availability', data),
};

// Bookings API
export const bookingAPI = {
    getAll: () => api.get('/bookings'),
    getUpcoming: () => api.get('/bookings/upcoming'),
    getPast: () => api.get('/bookings/past'),
    cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};

// Public API (no auth)
export const publicAPI = {
    getProfile: (username) => api.get(`/public/${username}`),
    getEventTypes: (username) => api.get(`/public/${username}/event-types`),
    getSlots: (username, eventTypeId, date) =>
        api.get(`/public/${username}/slots`, { params: { eventTypeId, date } }),
    book: (username, data) => api.post(`/public/${username}/book`, data),
};

// Admin API
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    toggleUser: (userId) => api.patch(`/admin/users/${userId}/toggle`),
    getSubscriptions: () => api.get('/admin/subscriptions'),
    getPayments: () => api.get('/admin/payments'),
    getStats: () => api.get('/admin/stats'),
};

// Integration API
export const integrationAPI = {
    getAll: () => api.get('/integrations'),
    disconnect: (provider) => api.delete(`/integrations/${provider}`),
    getSubscription: () => api.get('/integrations/subscription'),
    upgradePlan: (plan) => api.post('/integrations/subscription/upgrade', { plan }),
};

export default api;
