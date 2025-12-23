const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getUserAchievements } = require('../controllers/achievementsController');

/**
 * Achievements Routes
 * Handles user achievements and badges
 * 
 * Phase 5: Achievement tracking
 * 
 * TODO: Store achievements in database
 * TODO: Add achievement notifications
 * TODO: Add achievement sharing
 */

/**
 * Get user's achievements
 * GET /api/achievements
 * Requires authentication
 */
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.id;
        const achievements = getUserAchievements(userId);

        res.status(200).json({
            success: true,
            data: {
                total_count: achievements.length,
                achievements
            }
        });

    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch achievements'
        });
    }
});

/**
 * Get achievements for a specific user (public view)
 * GET /api/achievements/user/:userId
 */
router.get('/user/:userId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const achievements = getUserAchievements(userId);

        res.status(200).json({
            success: true,
            data: {
                user_id: userId,
                total_count: achievements.length,
                achievements
            }
        });

    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user achievements'
        });
    }
});

module.exports = router;
