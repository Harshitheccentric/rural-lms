const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const progressController = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

/**
 * Lesson Routes
 * 
 * Phase 3c: Added authentication and enrollment checks
 * Phase 4a: Added progress tracking
 * 
 * TODO: Phase 5 - Add input validation middleware
 */

// Get single lesson (requires authentication and enrollment)
router.get('/:id', authMiddleware, lessonController.getLessonById);

// Mark lesson as complete (requires authentication and enrollment)
router.post('/:id/complete', authMiddleware, progressController.markLessonComplete);

// TODO: Phase 5 - Add POST /api/courses/:courseId/lessons (create lesson - instructor/owner only)
// TODO: Phase 5 - Add PUT /api/lessons/:id (update lesson - instructor/owner only)
// TODO: Phase 5 - Add DELETE /api/lessons/:id (delete lesson - instructor/owner only)
// TODO: Phase 5 - Add PUT /api/lessons/:id/reorder (reorder lessons - instructor/owner only)

module.exports = router;


