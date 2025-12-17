const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

/**
 * Lesson Routes
 * 
 * TODO: Phase 2 - Add authentication middleware
 * TODO: Phase 2 - Add enrollment check middleware
 * TODO: Phase 2 - Add input validation middleware
 */

// Get single lesson
router.get('/:id', lessonController.getLessonById);

// TODO: Phase 2 - Add POST /api/courses/:courseId/lessons (create lesson - instructor/owner only)
// TODO: Phase 2 - Add PUT /api/lessons/:id (update lesson - instructor/owner only)
// TODO: Phase 2 - Add DELETE /api/lessons/:id (delete lesson - instructor/owner only)
// TODO: Phase 2 - Add PUT /api/lessons/:id/reorder (reorder lessons - instructor/owner only)
// TODO: Phase 2 - Add POST /api/lessons/:id/complete (mark complete - student only)

module.exports = router;
