import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Enable sending cookies with requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Store access token in memory (not localStorage for security)
let accessToken: string | null = null;

// Function to set access token
export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

// Function to get access token
export const getAccessToken = () => accessToken;

// Request interceptor - Add access token to headers
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.data.accessToken;
                setAccessToken(newAccessToken);

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear token and reject queued requests
                processQueue(refreshError as Error, null);
                setAccessToken(null);
                
                // Redirect to login or dispatch logout event
                window.dispatchEvent(new CustomEvent('auth:logout'));
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authAPI = {
    register: async (data: { name: string; email: string; password: string }) => {
        const response = await api.post('/auth/register', data);
        if (response.data.data.accessToken) {
            setAccessToken(response.data.data.accessToken);
        }
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data);
        if (response.data.data.accessToken) {
            setAccessToken(response.data.data.accessToken);
        }
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        setAccessToken(null);
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        if (response.data.data.accessToken) {
            setAccessToken(response.data.data.accessToken);
        }
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default api;
