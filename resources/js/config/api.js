import axios from 'axios';
import { logApiError, logDebug, logWarn } from '../utils/logger';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log de debug para desarrollo
        logDebug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        logApiError('Request Error', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación y logging
api.interceptors.response.use(
    (response) => {
        // Log de debug para desarrollo
        logDebug(`API Response: ${response.status} ${response.config.url}`, {
            status: response.status,
            data: response.data
        });
        
        return response;
    },
    (error) => {
        const endpoint = error.config?.url || 'unknown';
        
        // Log del error
        logApiError(endpoint, error, error.config?.data);
        
        // Manejar diferentes tipos de errores
        if (error.response?.status === 401) {
            logWarn('Unauthorized access, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Solo redirigir si no estamos ya en login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            logWarn('Forbidden access attempt', { endpoint });
        } else if (error.response?.status >= 500) {
            logWarn('Server error detected', { 
                status: error.response.status,
                endpoint 
            });
        } else if (error.code === 'ECONNABORTED') {
            logWarn('Request timeout', { endpoint });
        } else if (!error.response) {
            logWarn('Network error - no response received', { endpoint });
        }
        
        return Promise.reject(error);
    }
);

export default api;
