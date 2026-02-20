import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Important: Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add request logging here in development
        if (import.meta.env.DEV) {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

        // Handle specific status codes
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login only if not already there
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                console.error('Unauthorized access - redirecting to login');
                window.location.href = '/login';
            }
        }

        return Promise.reject({
            message,
            status: error.response?.status,
            data: error.response?.data,
        });
    }
);

// ========================
// Auth API
// ========================

export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data;
    },
};

// ========================
// Transaction API
// ========================

export const transactionAPI = {
    transfer: async (transferData) => {
        const response = await api.post('/transfer', transferData);
        return response.data;
    },

    getHistory: async (params = {}) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/transactions/stats');
        return response.data;
    },
};

export default api;
