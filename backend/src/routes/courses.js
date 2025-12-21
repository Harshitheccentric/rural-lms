const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

/**
 * Course Routes
 * 
 * Phase 3c: Added enrollment routes
 * 
 * TODO: Phase 4 - Add role-based authorization middleware
 * TODO: Phase 4 - Add input validation middleware
 */

// Get all courses (public)
router.get('/', courseController.getAllCourses);

// Get single course with lessons (public, but shows enrollment status if logged in)
router.get('/:id', optionalAuth, courseController.getCourseById);

// Enroll in course (requires authentication)
router.post('/:id/enroll', authMiddleware, enrollmentController.enrollInCourse);

// Unenroll from course (requires authentication)
router.delete('/:id/enroll', authMiddleware, enrollmentController.unenrollFromCourse);

// TODO: Phase 4 - Add POST /api/courses (create course - instructor only)
// TODO: Phase 4 - Add PUT /api/courses/:id (update course - instructor/owner only)
// TODO: Phase 4 - Add DELETE /api/courses/:id (delete course - instructor/owner only)

module.exports = router;

