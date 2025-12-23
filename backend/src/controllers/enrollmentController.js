const { db } = require('../config/database');
const { checkAndAwardAchievements } = require('./achievementsController');

/**
 * Enrollment Controller
 * Handles course enrollment operations
 * 
 * Phase 3c: Basic enrollment/unenrollment
 * Phase 5: Added achievement auto-awarding
 * 
 * TODO: Phase 4 - Add enrollment analytics
 * TODO: Phase 4 - Add enrollment limits/capacity
 * TODO: Phase 4 - Add waitlist functionality
 */

/**
 * Enroll in a course
 * POST /api/courses/:id/enroll
 * Requires authentication
 */
const enrollInCourse = (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id; // Set by authMiddleware

        // Check if course exists
        const course = db.prepare(`
      SELECT id, title FROM courses WHERE id = ?
    `).get(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = db.prepare(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                error: 'You are already enrolled in this course'
            });
        }

        // Create enrollment
        const result = db.prepare(`
      INSERT INTO enrollments (user_id, course_id, enrolled_at)
      VALUES (?, ?, ?)
    `).run(userId, courseId, new Date().toISOString());

        // Phase 5: Check and award achievements (first course)
        const newAchievements = checkAndAwardAchievements(userId);

        res.status(201).json({
            success: true,
            data: {
                id: result.lastInsertRowid,
                user_id: userId,
                course_id: courseId,
                course_title: course.title,
                enrolled_at: new Date().toISOString(),
                new_achievements: newAchievements
            },
            message: `Successfully enrolled in "${course.title}"`
        });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to enroll in course'
        });
    }
};

/**
 * Unenroll from a course
 * DELETE /api/courses/:id/enroll
 * Requires authentication
 */
const unenrollFromCourse = (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id; // Set by authMiddleware

        // Check if enrolled
        const enrollment = db.prepare(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                error: 'You are not enrolled in this course'
            });
        }

        // Delete enrollment
        db.prepare(`
      DELETE FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).run(userId, courseId);

        // TODO: Phase 4 - Also delete lesson progress when unenrolling

        res.json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    } catch (error) {
        console.error('Error unenrolling from course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unenroll from course'
        });
    }
};

module.exports = {
    enrollInCourse,
    unenrollFromCourse
};
