const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

/**
 * Authentication Routes
 * 
 * Phase 3b: Implemented JWT-based authentication
 * 
 * TODO: Phase 4 - Add password reset routes
 * TODO: Phase 4 - Add email verification routes
 * TODO: Phase 4 - Add OAuth routes (Google, GitHub, etc.)
 */

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (requires authentication)
router.get('/me', authMiddleware, authController.getCurrentUser);

// TODO: Phase 4 - Add logout endpoint (token blacklist)
// TODO: Phase 4 - Add POST /forgot-password
// TODO: Phase 4 - Add POST /reset-password
// TODO: Phase 4 - Add POST /verify-email

module.exports = router;
