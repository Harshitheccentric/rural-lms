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

    /**
     * Get course progress (Phase 4a)
     * GET /api/courses/:id/progress
     */
    getProgress: async (id) => {
        return fetchAPI(`/courses/${id}/progress`);
    },

    /**
     * Enroll in a course (Phase 3c)
     * POST /api/courses/:id/enroll
     */
    enroll: async (id) => {
        return fetchAPI(`/courses/${id}/enroll`, {
            method: 'POST'
        });
    },

    /**
     * Unenroll from a course (Phase 3c)
     * DELETE /api/courses/:id/enroll
     */
    unenroll: async (id) => {
        return fetchAPI(`/courses/${id}/enroll`, {
            method: 'DELETE'
        });
    },

    // TODO: Phase 5 - Add create, update, delete methods (instructor only)
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

    /**
     * Get lesson content with bandwidth awareness
     * GET /api/lessons/:id/content?bandwidth=low|medium|high
     */
    getContent: async (id, bandwidth = 'low') => {
        return fetchAPI(`/lessons/${id}/content?bandwidth=${bandwidth}`);
    },

    /**
     * Mark lesson as complete (Phase 4a)
     * POST /api/lessons/:id/complete
     */
    markComplete: async (id) => {
        return fetchAPI(`/lessons/${id}/complete`, {
            method: 'POST'
        });
    },

    // TODO: Phase 5 - Add create, update, delete methods (instructor only)
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

    // TODO: Phase 5 - Add password reset
    // TODO: Phase 5 - Add email verification
    // TODO: Phase 5 - Add update profile
};

/**
 * Dashboard API methods
 */
export const dashboardAPI = {
    /**
     * Get student dashboard data
     * GET /api/dashboard
     */
    getData: async () => {
        return fetchAPI('/dashboard');
    },

    /**
     * Get dashboard (alias)
     */
    getDashboard: async () => {
        return fetchAPI('/dashboard');
    }
};
