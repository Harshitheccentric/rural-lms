const { db } = require('../config/database');
const { checkAndAwardAchievements } = require('./achievementsController');

/**
 * Progress Controller
 * Handles lesson completion and progress tracking
 * 
 * Phase 4a: Minimal progress tracking
 * Phase 5: Added achievement auto-awarding
 * 
 * TODO: Phase 5 - Add time tracking
 * TODO: Phase 5 - Add quiz scores
 * TODO: Phase 5 - Add learning analytics
 */

/**
 * Mark a lesson as complete
 * POST /api/lessons/:id/complete
 * Requires authentication and enrollment
 */
const markLessonComplete = (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);
        const userId = req.user.id; // Set by authMiddleware

        // Get lesson and course info
        const lesson = db.prepare(`
      SELECT l.id, l.course_id, c.title as course_title
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
    `).get(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // Check if user is enrolled in the course
        const enrollment = db.prepare(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, lesson.course_id);

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                error: 'You must be enrolled in this course to track progress',
                code: 'NOT_ENROLLED'
            });
        }

        // Check if already completed
        const existingProgress = db.prepare(`
      SELECT id, completed FROM lesson_progress
      WHERE enrollment_id = ? AND lesson_id = ?
    `).get(enrollment.id, lessonId);

        if (existingProgress && existingProgress.completed) {
            return res.status(200).json({
                success: true,
                message: 'Lesson already marked as completed',
                data: {
                    lesson_id: lessonId,
                    completed: true,
                    already_completed: true
                }
            });
        }

        const completedAt = new Date().toISOString();

        if (existingProgress) {
            // Update existing record
            db.prepare(`
        UPDATE lesson_progress 
        SET completed = 1, completed_at = ?
        WHERE id = ?
      `).run(completedAt, existingProgress.id);
        } else {
            // Create new record
            db.prepare(`
        INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
        VALUES (?, ?, 1, ?)
      `).run(enrollment.id, lessonId, completedAt);
        }

        // Also insert into lesson_completions for dashboard tracking
        try {
            db.prepare(`
        INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id, completed_at)
        VALUES (?, ?, ?)
      `).run(userId, lessonId, completedAt);
        } catch (err) {
            // If already exists, that's fine
            console.log('Completion already tracked');
        }

        // Phase 5: Auto-award achievements
        const newAchievements = checkAndAwardAchievements(userId);

        // TODO: Phase 5 - Track time spent on lesson
        // TODO: Phase 5 - Trigger AI personalization based on progress

        res.json({
            success: true,
            message: 'Lesson marked as completed',
            data: {
                lesson_id: lessonId,
                completed: true,
                completed_at: completedAt,
                new_achievements: newAchievements
            }
        });
    } catch (error) {
        console.error('Error marking lesson complete:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark lesson as complete'
        });
    }
};

/**
 * Get course progress for current user
 * GET /api/courses/:id/progress
 * Requires authentication and enrollment
 */
const getCourseProgress = (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id; // Set by authMiddleware

        // Check if user is enrolled
        const enrollment = db.prepare(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                error: 'You must be enrolled in this course to view progress',
                code: 'NOT_ENROLLED'
            });
        }

        // Get total lessons in course
        const totalLessons = db.prepare(`
      SELECT COUNT(*) as count FROM lessons WHERE course_id = ?
    `).get(courseId).count;

        // Get completed lessons count
        const completedLessons = db.prepare(`
      SELECT COUNT(*) as count 
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.enrollment_id = ? AND l.course_id = ? AND lp.completed = 1
    `).get(enrollment.id, courseId).count;

        // Calculate percentage
        const percentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // TODO: Phase 5 - Add estimated time to complete
        // TODO: Phase 5 - Add learning velocity metrics
        // TODO: Phase 5 - Add AI-powered recommendations based on progress

        res.json({
            success: true,
            data: {
                course_id: courseId,
                total_lessons: totalLessons,
                completed_lessons: completedLessons,
                percentage: percentage,
                is_complete: completedLessons === totalLessons && totalLessons > 0
            }
        });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course progress'
        });
    }
};

module.exports = {
    markLessonComplete,
    getCourseProgress
};
