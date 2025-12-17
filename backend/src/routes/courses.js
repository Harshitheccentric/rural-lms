const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

/**
 * Course Routes
 * 
 * TODO: Phase 2 - Add authentication middleware
 * TODO: Phase 2 - Add role-based authorization middleware
 * TODO: Phase 2 - Add input validation middleware
 */

// Get all courses
router.get('/', courseController.getAllCourses);

// Get single course with lessons
router.get('/:id', courseController.getCourseById);

// TODO: Phase 2 - Add POST /api/courses (create course - instructor only)
// TODO: Phase 2 - Add PUT /api/courses/:id (update course - instructor/owner only)
// TODO: Phase 2 - Add DELETE /api/courses/:id (delete course - instructor/owner only)
// TODO: Phase 2 - Add POST /api/courses/:id/enroll (enroll in course - student only)
// TODO: Phase 2 - Add DELETE /api/courses/:id/enroll (unenroll - student only)

module.exports = router;
