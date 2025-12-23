const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const progressController = require('../controllers/progressController');
const contentController = require('../controllers/contentController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

/**
 * Lesson Routes
 * 
 * Phase 3c: Added authentication and enrollment checks
 * Phase 4a: Added progress tracking
 * Phase 6: Added adaptive content delivery
 * 
 * TODO: Phase 5 - Add input validation middleware
 */

// Get single lesson (requires authentication and enrollment)
router.get('/:id', authMiddleware, lessonController.getLessonById);

// Get lesson content with bandwidth awareness (requires authentication and enrollment)
router.get('/:id/content', optionalAuth, contentController.getLessonContent);

// Create content variant (instructor only - TODO: add instructor check)
router.post('/:id/variants', authMiddleware, contentController.createContentVariant);

// Mark lesson as complete (requires authentication and enrollment)
router.post('/:id/complete', authMiddleware, progressController.markLessonComplete);

// TODO: Phase 5 - Add POST /api/courses/:courseId/lessons (create lesson - instructor/owner only)
// TODO: Phase 5 - Add PUT /api/lessons/:id (update lesson - instructor/owner only)
// TODO: Phase 5 - Add DELETE /api/lessons/:id (delete lesson - instructor/owner only)
// TODO: Phase 5 - Add PUT /api/lessons/:id/reorder (reorder lessons - instructor/owner only)

module.exports = router;


