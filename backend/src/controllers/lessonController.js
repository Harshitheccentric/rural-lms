const { lessons, courses } = require('../data/mockData');

/**
 * Lesson Controller
 * Handles lesson-related operations
 * 
 * TODO: Phase 2 - Replace mock data with database queries
 * TODO: Phase 2 - Add authentication checks
 * TODO: Phase 2 - Add authorization (check enrollment or ownership)
 * TODO: Phase 2 - Add input validation
 */

/**
 * Get single lesson by ID
 * GET /api/lessons/:id
 */
const getLessonById = (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);

        // TODO: Phase 2 - Replace with database query
        const lesson = lessons.find(l => l.id === lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // TODO: Phase 2 - Check if user is enrolled in the course or is the instructor
        // TODO: Phase 2 - Track lesson progress/completion

        // Get course info for context
        const course = courses.find(c => c.id === lesson.course_id);

        res.json({
            success: true,
            data: {
                ...lesson,
                course_title: course ? course.title : 'Unknown Course'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lesson'
        });
    }
};

// TODO: Phase 2 - Add createLesson (instructor only, owner check)
// TODO: Phase 2 - Add updateLesson (instructor only, owner check)
// TODO: Phase 2 - Add deleteLesson (instructor only, owner check)
// TODO: Phase 2 - Add reorderLessons (instructor only, owner check)
// TODO: Phase 2 - Add markLessonComplete (student only, enrollment check)

module.exports = {
    getLessonById
};
