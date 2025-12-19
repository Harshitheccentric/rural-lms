const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval
 * 
 * TODO: Phase 4 - Add email verification
 * TODO: Phase 4 - Add password reset functionality
 * TODO: Phase 4 - Add input validation with Joi
 * TODO: Phase 4 - Add rate limiting
 */

/**
 * Generate JWT token for user
 */
function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Basic validation
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and full name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        // Check if user already exists
        const existingUser = db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).get(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const result = db.prepare(`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (?, ?, ?)
    `).run(email, password_hash, fullName);

        // Get created user
        const user = db.prepare(`
      SELECT id, email, full_name, created_at
      FROM users
      WHERE id = ?
    `).get(result.lastInsertRowid);

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = db.prepare(`
      SELECT id, email, password_hash, full_name, created_at
      FROM users
      WHERE email = ?
    `).get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Remove password_hash from response
        const { password_hash, ...userWithoutPassword } = user;

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 * Requires authentication
 */
const getCurrentUser = (req, res) => {
    try {
        // User is already attached to req by auth middleware
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info'
        });
    }
};

// TODO: Phase 4 - Add logout (token blacklist)
// TODO: Phase 4 - Add password reset request
// TODO: Phase 4 - Add password reset confirm
// TODO: Phase 4 - Add email verification

module.exports = {
    register,
    login,
    getCurrentUser
};
