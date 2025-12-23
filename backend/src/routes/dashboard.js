const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../config/database');

/**
 * Dashboard Routes
 * Provides user dashboard data
 * 
 * Phase 4: User dashboard with enrollments and progress
 * 
 * TODO: Add caching for performance
 * TODO: Add pagination for large datasets
 */

/**
 * Get user dashboard data
 * GET /api/dashboard
 * Requires authentication
 */
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's enrolled courses with progress
        const enrolledCourses = db.prepare(`
            SELECT 
                c.id,
                c.title,
                c.description,
                c.created_at,
                e.enrolled_at,
                COUNT(DISTINCT l.id) as total_lessons,
                COUNT(DISTINCT lc.id) as completed_lessons,
                CASE 
                    WHEN COUNT(DISTINCT l.id) > 0 
                    THEN ROUND(CAST(COUNT(DISTINCT lc.id) AS FLOAT) / COUNT(DISTINCT l.id) * 100, 1)
                    ELSE 0 
                END as progress_percentage
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN lessons l ON l.course_id = c.id
            LEFT JOIN lesson_completions lc ON lc.lesson_id = l.id AND lc.user_id = e.user_id
            WHERE e.user_id = ?
            GROUP BY c.id, c.title, c.description, c.created_at, e.enrolled_at
            ORDER BY e.enrolled_at DESC
        `).all(userId);

        // Get total statistics
        const stats = {
            total_enrollments: enrolledCourses.length,
            total_lessons_completed: db.prepare(`
                SELECT COUNT(*) as count 
                FROM lesson_completions 
                WHERE user_id = ?
            `).get(userId).count,
            courses_in_progress: enrolledCourses.filter(c => 
                c.progress_percentage > 0 && c.progress_percentage < 100
            ).length,
            courses_completed: enrolledCourses.filter(c => 
                c.progress_percentage === 100
            ).length
        };

        // Get recent activity
        const recentCompletions = db.prepare(`
            SELECT 
                lc.completed_at,
                l.title as lesson_title,
                c.title as course_title,
                c.id as course_id
            FROM lesson_completions lc
            JOIN lessons l ON lc.lesson_id = l.id
            JOIN courses c ON l.course_id = c.id
            WHERE lc.user_id = ?
            ORDER BY lc.completed_at DESC
            LIMIT 5
        `).all(userId);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    full_name: req.user.full_name,
                    email: req.user.email,
                    role: req.user.role
                },
                stats,
                enrolled_courses: enrolledCourses,
                recent_activity: recentCompletions
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});

module.exports = router;
