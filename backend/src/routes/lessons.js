const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authMiddleware } = require('../middleware/auth');

/**
 * Lesson Routes
 * 
 * Phase 3c: Added authentication and enrollment checks
 * 
 * TODO: Phase 4 - Add input validation middleware
 */

// Get single lesson (requires authentication and enrollment)
router.get('/:id', authMiddleware, lessonController.getLessonById);

// TODO: Phase 4 - Add POST /api/courses/:courseId/lessons (create lesson - instructor/owner only)
// TODO: Phase 4 - Add PUT /api/lessons/:id (update lesson - instructor/owner only)
// TODO: Phase 4 - Add DELETE /api/lessons/:id (delete lesson - instructor/owner only)
// TODO: Phase 4 - Add PUT /api/lessons/:id/reorder (reorder lessons - instructor/owner only)
// TODO: Phase 4 - Add POST /api/lessons/:id/complete (mark complete - student only)

module.exports = router;

