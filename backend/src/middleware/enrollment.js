const { db } = require('../config/database');

/**
 * Enrollment Middleware
 * Checks if user is enrolled in a course
 * 
 * Phase 3c: Basic enrollment check
 * 
 * TODO: Phase 4 - Add caching for enrollment checks
 * TODO: Phase 4 - Add instructor bypass (instructors can access all courses)
 */

/**
 * Check if user is enrolled in a course
 * Requires authMiddleware to be run first (to set req.user)
 * 
 * Usage: Add after authMiddleware on protected routes
 * The courseId should be available in req.params.id or req.params.courseId
 */
const checkEnrollment = (courseIdParam = 'courseId') => {
    return (req, res, next) => {
        try {
            // User must be authenticated (set by authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userId = req.user.id;
            const courseId = parseInt(req.params[courseIdParam] || req.params.id);

            if (!courseId) {
                return res.status(400).json({
                    success: false,
                    error: 'Course ID is required'
                });
            }

            // Check enrollment
            const enrollment = db.prepare(`
        SELECT id, enrolled_at 
        FROM enrollments 
        WHERE user_id = ? AND course_id = ?
      `).get(userId, courseId);

            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    error: 'You must be enrolled in this course to access this content',
                    code: 'NOT_ENROLLED'
                });
            }

            // Attach enrollment to request for future use
            req.enrollment = enrollment;

            next();
        } catch (error) {
            console.error('Enrollment check error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to verify enrollment'
            });
        }
    };
};

module.exports = {
    checkEnrollment
};
