/**
 * API Service Layer
 * Handles all communication with the backend
 * 
 * Phase 3b: Added JWT token support
 * 
 * TODO: Phase 4 - Add request interceptors for token refresh
 * TODO: Phase 4 - Add retry logic for failed requests
 * TODO: Phase 4 - Add request caching
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling and auth support
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Course API methods
 */
export const courseAPI = {
    /**
     * Get all courses
     * GET /api/courses
     */
    getAll: async () => {
        return fetchAPI('/courses');
    },

    /**
     * Get single course with lessons
     * GET /api/courses/:id
     */
    getById: async (id) => {
        return fetchAPI(`/courses/${id}`);
    },

    // TODO: Phase 4 - Add create, update, delete methods (instructor only)
    // TODO: Phase 4 - Add enroll/unenroll methods (student only)
};

/**
 * Lesson API methods
 */
export const lessonAPI = {
    /**
     * Get single lesson
     * GET /api/lessons/:id
     */
    getById: async (id) => {
        return fetchAPI(`/lessons/${id}`);
    },

    // TODO: Phase 4 - Add create, update, delete methods (instructor only)
    // TODO: Phase 4 - Add mark complete method (student only)
};

/**
 * Auth API methods
 * Note: Auth methods are handled directly in AuthContext
 * This is kept for reference and future expansion
 */
export const authAPI = {
    // Implemented in AuthContext:
    // - register(email, password, fullName)
    // - login(email, password)
    // - getCurrentUser() via /api/auth/me

    // TODO: Phase 4 - Add password reset
    // TODO: Phase 4 - Add email verification
    // TODO: Phase 4 - Add update profile
};
