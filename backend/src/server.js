require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware Setup
 * 
 * TODO: Phase 2 - Add helmet for security headers
 * TODO: Phase 2 - Add rate limiting
 * TODO: Phase 2 - Add request logging (morgan)
 * TODO: Phase 2 - Add error handling middleware
 * TODO: Phase 2 - Add authentication middleware
 */

// Enable CORS for frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Rural LMS API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Rural LMS API',
        version: '0.1.0 (Phase 1)',
        endpoints: {
            health: '/health',
            courses: '/api/courses',
            lessons: '/api/lessons',
            auth: '/api/auth (placeholder)'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});

// TODO: Phase 2 - Add global error handler middleware

/**
 * Initialize Database and Start Server
 */

// Initialize database (create tables and seed data if needed)
try {
    initializeDatabase();
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     Rural LMS API - Phase 3a           ║
╚════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: SQLite (rural-lms.db)

Available endpoints:
  GET  /health
  GET  /api/courses
  GET  /api/courses/:id
  GET  /api/lessons/:id
  POST /api/auth/register (placeholder)
  POST /api/auth/login (placeholder)

Phase 3a Features:
  ✓ SQLite database integration
  ✓ Read-only course and lesson APIs
  ✓ Database-backed data storage

Phase 4 TODO:
  ⧗ PostgreSQL migration
  ⧗ User authentication
  ⧗ Role-based authorization
  ⧗ CRUD operations
  `);
});

module.exports = app;
