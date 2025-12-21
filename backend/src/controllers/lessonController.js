const { db } = require('../config/database');

/**
 * Lesson Controller
 * Handles lesson-related operations using SQLite database
 * 
 * TODO: Phase 4 - Add authentication checks
 * TODO: Phase 4 - Add authorization (check enrollment or ownership)
 * TODO: Phase 4 - Add input validation
 * TODO: Phase 4 - Track lesson progress/completion
 */

/**
 * Get single lesson by ID
 * GET /api/lessons/:id
 * 
 * Phase 3c: Requires authentication and enrollment
 */
const getLessonById = (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);

        // Query lesson with course title using JOIN
        const lesson = db.prepare(`
      SELECT 
        l.*,
        c.title as course_title,
        c.id as course_id
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
    `).get(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // Check if user is enrolled in the course (Phase 3c)
        const enrollment = db.prepare(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(req.user.id, lesson.course_id);

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                error: 'You must be enrolled in this course to access this lesson',
                code: 'NOT_ENROLLED',
                course_id: lesson.course_id
            });
        }

        // TODO: Phase 4 - Track lesson view/progress
        // TODO: Phase 4 - Add AI-generated summary

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lesson'
        });
    }
};

// TODO: Phase 4 - Add createLesson (instructor only, owner check)
// TODO: Phase 4 - Add updateLesson (instructor only, owner check)
// TODO: Phase 4 - Add deleteLesson (instructor only, owner check)
// TODO: Phase 4 - Add reorderLessons (instructor only, owner check)
// TODO: Phase 4 - Add markLessonComplete (student only, enrollment check)

module.exports = {
    getLessonById
};
