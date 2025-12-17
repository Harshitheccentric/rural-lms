const { courses, lessons } = require('../data/mockData');

/**
 * Course Controller
 * Handles course-related operations
 * 
 * TODO: Phase 2 - Replace mock data with database queries
 * TODO: Phase 2 - Add authentication checks
 * TODO: Phase 2 - Add authorization (instructor-only for creation)
 * TODO: Phase 2 - Add input validation
 */

/**
 * Get all courses
 * GET /api/courses
 */
const getAllCourses = (req, res) => {
    try {
        // TODO: Phase 2 - Add filtering (published only for students, all for instructors)
        // TODO: Phase 2 - Add pagination
        // TODO: Phase 2 - Add search functionality

        const coursesWithLessonCount = courses.map(course => ({
            ...course,
            lesson_count: lessons.filter(l => l.course_id === course.id).length
        }));

        res.json({
            success: true,
            data: coursesWithLessonCount,
            count: coursesWithLessonCount.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
};

/**
 * Get single course by ID with its lessons
 * GET /api/courses/:id
 */
const getCourseById = (req, res) => {
    try {
        const courseId = parseInt(req.params.id);

        // TODO: Phase 2 - Replace with database query
        const course = courses.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // TODO: Phase 2 - Check enrollment status for students
        // TODO: Phase 2 - Only show lessons if enrolled or is instructor

        // Get all lessons for this course
        const courseLessons = lessons
            .filter(l => l.course_id === courseId)
            .sort((a, b) => a.order_index - b.order_index);

        res.json({
            success: true,
            data: {
                ...course,
                lessons: courseLessons
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
};

// TODO: Phase 2 - Add createCourse (instructor only)
// TODO: Phase 2 - Add updateCourse (instructor only, owner check)
// TODO: Phase 2 - Add deleteCourse (instructor only, owner check)
// TODO: Phase 2 - Add enrollInCourse (student only)
// TODO: Phase 2 - Add unenrollFromCourse (student only)

module.exports = {
    getAllCourses,
    getCourseById
};
