const { db } = require('../config/database');

/**
 * Content Controller
 * Handles adaptive content delivery based on bandwidth
 * 
 * Phase 6: Bandwidth-aware content variants
 * 
 * TODO: Add content variant storage (files/URLs)
 * TODO: Add content compression
 * TODO: Add CDN integration
 */

/**
 * Get lesson content optimized for user's bandwidth
 * GET /api/lessons/:id/content?bandwidth=low|medium|high
 * 
 * Returns appropriate content variant based on network conditions
 */
const getLessonContent = (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);
        const bandwidth = req.query.bandwidth || 'medium'; // default to medium

        // Validate bandwidth parameter
        const validBandwidths = ['low', 'medium', 'high'];
        if (!validBandwidths.includes(bandwidth)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bandwidth parameter. Must be: low, medium, or high'
            });
        }

        // Get lesson details
        const lesson = db.prepare(`
            SELECT 
                l.*,
                c.title as course_title,
                c.id as course_id
            FROM lessons l
            LEFT JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        `).get(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // If user is authenticated, check enrollment
        if (req.user) {
            const enrollment = db.prepare(`
                SELECT id FROM enrollments 
                WHERE user_id = ? AND course_id = ?
            `).get(req.user.id, lesson.course_id);

            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    error: 'You must be enrolled in this course to access lesson content'
                });
            }
        }

        // Try to get content variant for requested bandwidth
        // Note: content_variants table needs to be created in database
        let variant = null;
        
        try {
            variant = db.prepare(`
                SELECT * FROM content_variants 
                WHERE lesson_id = ? AND bandwidth_type = ?
            `).get(lessonId, bandwidth);
        } catch (error) {
            // Table might not exist yet - will fall back to default content
            console.log('Content variants table not available, using default content');
        }

        // Get all available variants for this lesson
        let availableVariants = [];
        try {
            availableVariants = db.prepare(`
                SELECT bandwidth_type, content_type, file_size_mb 
                FROM content_variants 
                WHERE lesson_id = ?
            `).all(lessonId);
        } catch (error) {
            // Table doesn't exist
        }

        // If no variant found or table doesn't exist, create default response
        if (!variant) {
            // Fallback to basic lesson content
            // Determine default content type based on bandwidth
            let contentType = 'text';
            let contentText = lesson.content || 'Content not available yet.';
            
            if (bandwidth === 'high') {
                contentType = 'video';
            } else if (bandwidth === 'medium') {
                contentType = 'audio';
            }

            return res.status(200).json({
                success: true,
                data: {
                    lesson_id: lesson.id,
                    title: lesson.title,
                    course_title: lesson.course_title,
                    bandwidth_type: bandwidth,
                    content_type: contentType,
                    content_url: null,
                    content_text: contentText,
                    file_size_mb: null,
                    duration_minutes: null,
                    quality: null,
                    available_variants: availableVariants
                },
                message: 'Default content returned (no variants configured)'
            });
        }

        // Return the appropriate content variant
        res.status(200).json({
            success: true,
            data: {
                lesson_id: lesson.id,
                title: lesson.title,
                course_title: lesson.course_title,
                bandwidth_type: variant.bandwidth_type,
                content_type: variant.content_type,
                content_url: variant.content_url,
                content_text: variant.content_text,
                file_size_mb: variant.file_size_mb,
                duration_minutes: variant.duration_minutes,
                quality: variant.quality,
                available_variants: availableVariants
            }
        });

    } catch (error) {
        console.error('Error getting lesson content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve lesson content'
        });
    }
};

/**
 * Create content variant for a lesson
 * POST /api/lessons/:id/variants
 * 
 * Body: {
 *   bandwidth_type: 'low' | 'medium' | 'high',
 *   content_type: 'video' | 'audio' | 'text' | 'pdf',
 *   content_url: 'https://...',
 *   content_text: '...',
 *   file_size_mb: 50,
 *   duration_minutes: 15,
 *   quality: '720p'
 * }
 */
const createContentVariant = (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);
        const {
            bandwidth_type,
            content_type,
            content_url,
            content_text,
            file_size_mb,
            duration_minutes,
            quality
        } = req.body;

        // Validate required fields
        if (!bandwidth_type || !content_type) {
            return res.status(400).json({
                success: false,
                error: 'bandwidth_type and content_type are required'
            });
        }

        // Validate bandwidth_type
        const validBandwidths = ['low', 'medium', 'high'];
        if (!validBandwidths.includes(bandwidth_type)) {
            return res.status(400).json({
                success: false,
                error: 'bandwidth_type must be: low, medium, or high'
            });
        }

        // Validate content_type
        const validContentTypes = ['video', 'audio', 'text', 'pdf'];
        if (!validContentTypes.includes(content_type)) {
            return res.status(400).json({
                success: false,
                error: 'content_type must be: video, audio, text, or pdf'
            });
        }

        // Check if lesson exists
        const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // TODO: Check if user is instructor/owner of the course

        // Create content_variants table if it doesn't exist
        db.prepare(`
            CREATE TABLE IF NOT EXISTS content_variants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lesson_id INTEGER NOT NULL,
                bandwidth_type TEXT NOT NULL,
                content_type TEXT NOT NULL,
                content_url TEXT,
                content_text TEXT,
                file_size_mb INTEGER,
                duration_minutes INTEGER,
                quality TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id),
                UNIQUE(lesson_id, bandwidth_type)
            )
        `).run();

        // Check if variant already exists
        const existing = db.prepare(`
            SELECT id FROM content_variants 
            WHERE lesson_id = ? AND bandwidth_type = ?
        `).get(lessonId, bandwidth_type);

        let result;
        if (existing) {
            // Update existing variant
            result = db.prepare(`
                UPDATE content_variants 
                SET content_type = ?,
                    content_url = ?,
                    content_text = ?,
                    file_size_mb = ?,
                    duration_minutes = ?,
                    quality = ?
                WHERE lesson_id = ? AND bandwidth_type = ?
            `).run(
                content_type,
                content_url || null,
                content_text || null,
                file_size_mb || null,
                duration_minutes || null,
                quality || null,
                lessonId,
                bandwidth_type
            );

            res.status(200).json({
                success: true,
                data: {
                    id: existing.id,
                    lesson_id: lessonId,
                    bandwidth_type,
                    content_type,
                    content_url,
                    content_text,
                    file_size_mb,
                    duration_minutes,
                    quality
                },
                message: 'Content variant updated successfully'
            });
        } else {
            // Insert new variant
            result = db.prepare(`
                INSERT INTO content_variants (
                    lesson_id, bandwidth_type, content_type,
                    content_url, content_text, file_size_mb,
                    duration_minutes, quality
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                lessonId,
                bandwidth_type,
                content_type,
                content_url || null,
                content_text || null,
                file_size_mb || null,
                duration_minutes || null,
                quality || null
            );

            res.status(201).json({
                success: true,
                data: {
                    id: result.lastInsertRowid,
                    lesson_id: lessonId,
                    bandwidth_type,
                    content_type,
                    content_url,
                    content_text,
                    file_size_mb,
                    duration_minutes,
                    quality
                },
                message: 'Content variant created successfully'
            });
        }

    } catch (error) {
        console.error('Error creating content variant:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create content variant'
        });
    }
};

/**
 * Speed test endpoint
 * GET /api/speed-test
 * 
 * Returns a 500KB test file for bandwidth measurement
 */
const speedTest = (req, res) => {
    try {
        // Generate 500KB of random data
        const testData = Buffer.alloc(500000, '0');
        
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': '500000',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.send(testData);
    } catch (error) {
        console.error('Error in speed test:', error);
        res.status(500).json({
            success: false,
            error: 'Speed test failed'
        });
    }
};

module.exports = {
    getLessonContent,
    createContentVariant,
    speedTest
};
