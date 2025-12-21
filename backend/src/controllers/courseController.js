const { db } = require('../config/database');

/**
 * Course Controller
 * Handles course-related operations using SQLite database
 * 
 * TODO: Phase 4 - Add filtering (published only for students, all for instructors)
 * TODO: Phase 4 - Add pagination
 * TODO: Phase 4 - Add search functionality
 * TODO: Phase 4 - Add authentication checks
 * TODO: Phase 4 - Add authorization (instructor-only for creation)
 * TODO: Phase 4 - Add input validation
 */

/**
 * Get all courses
 * GET /api/courses
 */
const getAllCourses = (req, res) => {
    try {
        // Query all courses from database
        const courses = db.prepare(`
      SELECT 
        c.*,
        COUNT(l.id) as lesson_count
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();

        // Convert SQLite boolean (0/1) to JavaScript boolean
        const formattedCourses = courses.map(course => ({
            ...course,
            is_published: Boolean(course.is_published)
        }));

        res.json({
            success: true,
            data: formattedCourses,
            count: formattedCourses.length
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
};

/**
 * Get single course by ID with its lessons
 * GET /api/courses/:id
 * 
 * Phase 3c: Added enrollment status when user is authenticated
 */
const getCourseById = (req, res) => {
    try {
        const courseId = parseInt(req.params.id);

        // Query course from database
        const course = db.prepare(`
      SELECT * FROM courses WHERE id = ?
    `).get(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Query lessons for this course
        const lessons = db.prepare(`
      SELECT * FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `).all(courseId);

        // Check enrollment status if user is authenticated
        let isEnrolled = false;
        if (req.user) {
            const enrollment = db.prepare(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ?
      `).get(req.user.id, courseId);
            isEnrolled = !!enrollment;
        }

        // Format response
        const formattedCourse = {
            ...course,
            is_published: Boolean(course.is_published),
            lessons: lessons,
            is_enrolled: isEnrolled // Phase 3c: Include enrollment status
        };

        res.json({
            success: true,
            data: formattedCourse
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
};

// TODO: Phase 4 - Add createCourse (instructor only)
// TODO: Phase 4 - Add updateCourse (instructor only, owner check)
// TODO: Phase 4 - Add deleteCourse (instructor only, owner check)
// TODO: Phase 4 - Add enrollInCourse (student only)
// TODO: Phase 4 - Add unenrollFromCourse (student only)

module.exports = {
    getAllCourses,
    getCourseById
};
