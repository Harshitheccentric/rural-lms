import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLearningMode } from '../context/LearningModeContext';
import { LEARNING_MODES } from '../utils/learningModeUtils';
import Header from '../components/Header';
import LearningModeSelector from '../components/LearningModeSelector';
import './LessonPage.css';

/**
 * Lesson Page - Shows lesson content
 * 
 * Phase 3c: Added authorization checks (authentication + enrollment)
 * Phase 4a: Added lesson completion tracking
 * Phase 5a: Added mode-specific content rendering
 * 
 * TODO: Phase 5 - Add previous/next lesson navigation
 * TODO: Phase 5 - Track reading progress
 * TODO: Phase 6 - Add real video streaming
 * TODO: Phase 7 - Add real audio generation
 * TODO: Phase 8 - Add AI summary feature
 */
function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { effectiveMode } = useLearningMode();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notEnrolled, setNotEnrolled] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        loadLesson();
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            setLoading(true);
            setError(null);
            setNotEnrolled(false);
            const data = await lessonAPI.getById(lessonId);
            setLesson(data);
        } catch (err) {
            // Check if error is due to not being enrolled
            if (err.message && err.message.includes('403')) {
                setNotEnrolled(true);
            } else {
                setError('Failed to load lesson. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        try {
            setCompleting(true);
            setError(null);
            await lessonAPI.markComplete(lessonId);
            // Reload lesson to update completion status
            await loadLesson();
        } catch (err) {
            setError('Failed to mark lesson as complete. Please try again.');
            console.error(err);
        } finally {
            setCompleting(false);
        }
    };

    const goBack = () => {
        if (lesson?.course_id) {
            navigate(`/courses/${lesson.course_id}`);
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading lesson...</div>
            </div>
        );
    }

    // Phase 3c: Not authenticated
    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <div className="container">
                    <div className="access-denied">
                        <h2>Authentication Required</h2>
                        <p>You must be logged in to access lessons.</p>
                        <Link to="/login" className="login-link">Login to continue</Link>
                        <Link to="/" className="back-link">← Back to courses</Link>
                    </div>
                </div>
            </>
        );
    }

    // Phase 3c: Not enrolled in course
    if (notEnrolled) {
        return (
            <>
                <Header />
                <div className="container">
                    <div className="access-denied">
                        <h2>Access Denied</h2>
                        <p>You must be enrolled in this course to access this lesson.</p>
                        <button onClick={goBack} className="back-button">
                            ← Go to course page to enroll
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (error && !lesson) {
        return (
            <div className="container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={loadLesson}>Retry</button>
                    <button onClick={goBack} className="back-button">← Back</button>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="container">
                <div className="error">
                    <p>Lesson not found</p>
                    <button onClick={goBack} className="back-button">← Back</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="container">
                <button onClick={goBack} className="back-button">
                    ← Back to {lesson.course_title}
                </button>

                {/* Phase 5a: Learning mode selector */}
                <LearningModeSelector />

                <article className="lesson-content">
                    <header className="lesson-header">
                        <p className="course-title">{lesson.course_title}</p>
                        <h1>{lesson.title}</h1>

                        {/* Phase 4a: Completion status and button */}
                        <div className="completion-section">
                            {lesson.is_completed ? (
                                <div className="completed-badge">
                                    ✓ Completed
                                    {lesson.completed_at && (
                                        <span className="completed-date">
                                            {' on ' + new Date(lesson.completed_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={completing}
                                    className="complete-button"
                                >
                                    {completing ? 'Marking Complete...' : 'Mark as Completed'}
                                </button>
                            )}
                        </div>

                        {error && lesson && (
                            <div className="error-message">{error}</div>
                        )}
                    </header>

                    {/* Phase 5a: Mode-specific content rendering */}
                    <div className="lesson-media-container">
                        {effectiveMode === LEARNING_MODES.VIDEO && (
                            <div className="video-player-placeholder">
                                <div className="placeholder-icon">▶️</div>
                                <p className="placeholder-text">
                                    <strong>Video player coming soon</strong>
                                </p>
                                <p className="placeholder-description">
                                    Video lessons will be available in Phase 6
                                </p>
                                {/* TODO: Phase 6 - Integrate real video streaming */}
                                {/* TODO: Phase 6 - Add video quality selection */}
                                {/* TODO: Phase 6 - Implement adaptive bitrate streaming */}
                            </div>
                        )}

                        {effectiveMode === LEARNING_MODES.AUDIO && (
                            <>
                                <div className="audio-player-placeholder">
                                    <div className="placeholder-icon">🎧</div>
                                    <p className="placeholder-text">
                                        <strong>Audio player coming soon</strong>
                                    </p>
                                    <p className="placeholder-description">
                                        Audio lessons will be generated in Phase 7
                                    </p>
                                    {/* TODO: Phase 7 - Generate audio from lesson text using TTS */}
                                    {/* TODO: Phase 7 - Add audio playback controls */}
                                    {/* TODO: Phase 7 - Cache audio files for offline use */}
                                </div>
                                <div className="audio-image-placeholder">
                                    <div className="placeholder-icon">🖼️</div>
                                    <p className="placeholder-text">Lesson illustration</p>
                                </div>
                            </>
                        )}

                        {effectiveMode === LEARNING_MODES.TEXT && (
                            <div className="text-mode-features">
                                <div className="ai-summary-placeholder">
                                    <div className="placeholder-icon">🤖</div>
                                    <p className="placeholder-text">
                                        <strong>AI Summary coming soon</strong>
                                    </p>
                                    <p className="placeholder-description">
                                        Get a personalized summary of this lesson
                                    </p>
                                    {/* TODO: Phase 8 - Generate AI summaries using LLM */}
                                    {/* TODO: Phase 8 - Add summary quality indicators */}
                                    {/* TODO: Phase 8 - Personalize summaries based on user level */}
                                </div>
                                <div className="offline-pack-placeholder">
                                    <div className="placeholder-icon">📦</div>
                                    <p className="placeholder-text">
                                        <strong>Offline pack coming soon</strong>
                                    </p>
                                    <p className="placeholder-description">
                                        Download this lesson for offline access
                                    </p>
                                    {/* TODO: Phase 9 - Create offline content packs */}
                                    {/* TODO: Phase 9 - Implement progressive download */}
                                    {/* TODO: Phase 9 - Add offline sync status */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lesson text content (always shown in all modes) */}
                    <div className="lesson-body">
                        <h2>Lesson Content</h2>
                        {lesson.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() ? (
                                <p key={index}>{paragraph}</p>
                            ) : (
                                <br key={index} />
                            )
                        ))}
                    </div>
                </article>
            </div>
        </>
    );
}

export default LessonPage;

