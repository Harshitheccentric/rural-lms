const { db } = require('../config/database');

/**
 * Achievements Controller
 * Handles achievement/badge awarding logic
 * 
 * Phase 5: Basic achievement tracking
 * 
 * TODO: Add more achievement types
 * TODO: Add achievement display in frontend
 * TODO: Add achievement notifications
 */

/**
 * Check and award achievements based on user progress
 * @param {number} userId - User ID to check achievements for
 * @returns {Array} - Array of newly awarded achievements
 */
const checkAndAwardAchievements = (userId) => {
    try {
        const newAchievements = [];

        // Check "First Course" achievement
        const enrollmentCount = db.prepare(`
            SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?
        `).get(userId);

        if (enrollmentCount.count === 1) {
            // Award "First Course" achievement
            newAchievements.push({
                type: 'first_course',
                title: 'First Steps',
                description: 'Enrolled in your first course',
                awarded_at: new Date().toISOString()
            });
        }

        // Check "Course Completionist" achievement (completed 5 courses)
        const completedCourses = db.prepare(`
            SELECT COUNT(DISTINCT e.course_id) as count
            FROM enrollments e
            JOIN lessons l ON l.course_id = e.course_id
            LEFT JOIN lesson_completions lc ON lc.lesson_id = l.id AND lc.user_id = e.user_id
            WHERE e.user_id = ?
            GROUP BY e.course_id
            HAVING COUNT(l.id) = COUNT(lc.id)
        `).get(userId);

        if (completedCourses && completedCourses.count >= 5) {
            newAchievements.push({
                type: 'course_completionist',
                title: 'Course Completionist',
                description: 'Completed 5 courses',
                awarded_at: new Date().toISOString()
            });
        }

        // Check "Dedicated Learner" achievement (10 lessons completed)
        const lessonsCompleted = db.prepare(`
            SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?
        `).get(userId);

        if (lessonsCompleted.count === 10) {
            newAchievements.push({
                type: 'dedicated_learner',
                title: 'Dedicated Learner',
                description: 'Completed 10 lessons',
                awarded_at: new Date().toISOString()
            });
        }

        // Check "Week Streak" achievement (logged in 7 days in a row)
        // TODO: Implement login tracking for streak achievements

        return newAchievements;

    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

/**
 * Get all achievements for a user
 * @param {number} userId - User ID
 * @returns {Array} - Array of user achievements
 */
const getUserAchievements = (userId) => {
    try {
        // TODO: Store achievements in database table
        // For now, recalculate based on current progress
        const achievements = [];

        const enrollmentCount = db.prepare(`
            SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?
        `).get(userId);

        if (enrollmentCount.count >= 1) {
            achievements.push({
                type: 'first_course',
                title: 'First Steps',
                description: 'Enrolled in your first course'
            });
        }

        const lessonsCompleted = db.prepare(`
            SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?
        `).get(userId);

        if (lessonsCompleted.count >= 10) {
            achievements.push({
                type: 'dedicated_learner',
                title: 'Dedicated Learner',
                description: 'Completed 10 lessons'
            });
        }

        return achievements;

    } catch (error) {
        console.error('Error getting user achievements:', error);
        return [];
    }
};

module.exports = {
    checkAndAwardAchievements,
    getUserAchievements
};
