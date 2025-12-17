/**
 * API Service Layer
 * Handles all communication with the backend
 * 
 * TODO: Phase 3 - Add authentication headers
 * TODO: Phase 3 - Add request interceptors for token refresh
 * TODO: Phase 3 - Add retry logic for failed requests
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

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

    // TODO: Phase 3 - Add create, update, delete methods
    // TODO: Phase 3 - Add enroll/unenroll methods
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

    // TODO: Phase 3 - Add create, update, delete methods
    // TODO: Phase 3 - Add mark complete method
};

/**
 * Auth API methods (placeholder)
 */
export const authAPI = {
    // TODO: Phase 3 - Implement login
    // TODO: Phase 3 - Implement register
    // TODO: Phase 3 - Implement logout
    // TODO: Phase 3 - Implement getCurrentUser
};
