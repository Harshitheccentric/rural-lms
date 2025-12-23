const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * 
 * TODO: Phase 4 - Add token refresh logic
 * TODO: Phase 4 - Add token blacklist for logout
 * TODO: Phase 4 - Add rate limiting for auth endpoints
 */

/**
 * Verify JWT token and attach user to request
 * Usage: Add as middleware to protected routes
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Please login first.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token. Please login again.'
            });
        }

        // Get user from database
        const user = db.prepare(`
      SELECT id, email, full_name, created_at
      FROM users
      WHERE id = ?
    `).get(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found. Please login again.'
            });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for routes that work both with and without auth
 * 
 * TODO: Phase 4 - Use this for course/lesson routes to show enrollment status
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without user
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = db.prepare(`
        SELECT id, email, full_name, created_at
        FROM users
        WHERE id = ?
      `).get(decoded.userId);

            req.user = user || null;
        } catch (err) {
            // Invalid token, continue without user
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        req.user = null;
        next();
    }
};

module.exports = {
    authMiddleware,
    authenticate: authMiddleware, // Alias for consistency
    optionalAuth
};
