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
 * Lesson Page - Shows lesson content with adaptive delivery
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
    
    // Offline and reader preferences state
    const [isOffline, setIsOffline] = useState(false);
    const [isSavedOffline, setIsSavedOffline] = useState(false);
    const [textSize, setTextSize] = useState(() => localStorage.getItem('reader-text-size') || 'medium');
    const [nightMode, setNightMode] = useState(() => localStorage.getItem('reader-night-mode') === 'true');

    useEffect(() => {
        loadLesson();
    }, [lessonId, bandwidth]); // Reload when bandwidth changes

    // Check if lesson is saved offline on mount
    useEffect(() => {
        checkIfSavedOffline();
    }, [lessonId]);

    // Apply reader preferences to body element
    useEffect(() => {
        document.body.classList.toggle('night-mode', nightMode);
        return () => {
            document.body.classList.remove('night-mode');
        };
    }, [nightMode]);

    const checkIfSavedOffline = () => {
        const saved = localStorage.getItem(`lesson-${lessonId}`);
        setIsSavedOffline(!!saved);
    };

    const loadLesson = async () => {
        try {
            setLoading(true);
            setError(null);
            setNotEnrolled(false);
            setIsOffline(false);

            // Try to fetch content with bandwidth awareness
            const effectiveBandwidth = dataSaverMode ? BANDWIDTH_CATEGORIES.LOW : bandwidth;
            const data = await lessonAPI.getContent(lessonId, effectiveBandwidth);
            setLesson(data);
            
            // Auto-cache lesson after successful load
            saveToCache(data);
        } catch (err) {
            // If network fails, try to load from cache
            const cachedLesson = loadFromCache();
            if (cachedLesson) {
                setLesson(cachedLesson);
                setIsOffline(true);
                setError('Viewing offline version - Network unavailable');
            } else {
                // Check if error is due to not being enrolled
                if (err.message && err.message.includes('403')) {
                    setNotEnrolled(true);
                } else {
                    setError('Failed to load lesson. Please try again.');
                }
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadFromCache = () => {
        const cached = localStorage.getItem(`lesson-${lessonId}`);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('Failed to parse cached lesson', e);
                return null;
            }
        }
        return null;
    };

    const saveToCache = (lessonData) => {
        try {
            const cacheData = {
                ...lessonData,
                cached_at: new Date().toISOString()
            };
            localStorage.setItem(`lesson-${lessonId}`, JSON.stringify(cacheData));
            setIsSavedOffline(true);
        } catch (e) {
            console.error('Failed to cache lesson', e);
        }
    };

    const handleSaveOffline = () => {
        if (lesson) {
            saveToCache(lesson);
            alert('Lesson saved for offline reading!');
        }
    };

    const handleRemoveOffline = () => {
        localStorage.removeItem(`lesson-${lessonId}`);
        setIsSavedOffline(false);
        alert('Offline version removed');
    };

    const handleTextSizeChange = (size) => {
        setTextSize(size);
        localStorage.setItem('reader-text-size', size);
    };

    // Network control functions
    const toggleDataSaver = () => {
        setDataSaverMode(prev => !prev);
    };

    const handleBandwidthChange = (newBandwidth) => {
        setBandwidth(newBandwidth);
        setBandwidthInfo({ ...bandwidthInfo, isManual: true });
        // Reload lesson with new bandwidth
        loadLesson();
    };

    const clearManualBandwidth = () => {
        setBandwidth(BANDWIDTH_CATEGORIES.MEDIUM);
        setBandwidthInfo({ ...bandwidthInfo, isManual: false });
        loadLesson();
    };

    const getBandwidthIcon = (bw) => {
        switch (bw) {
            case BANDWIDTH_CATEGORIES.HIGH:
                return '📶';
            case BANDWIDTH_CATEGORIES.MEDIUM:
                return '📡';
            case BANDWIDTH_CATEGORIES.LOW:
                return '📉';
            default:
                return '📶';
        }
    };

    const getBandwidthLabel = (bw) => {
        switch (bw) {
            case BANDWIDTH_CATEGORIES.HIGH:
                return 'High Speed';
            case BANDWIDTH_CATEGORIES.MEDIUM:
                return 'Medium Speed';
            case BANDWIDTH_CATEGORIES.LOW:
                return 'Low Speed';
            default:
                return 'Unknown';
        }
    };

    const handleNightModeToggle = () => {
        const newMode = !nightMode;
        setNightMode(newMode);
        localStorage.setItem('reader-night-mode', newMode.toString());
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

    // Helper function to render content based on type
    const renderContent = () => {
        if (!lesson) return null;

        const variant = lesson.selected_variant;

        // If offline, always show cached text content
        if (isOffline) {
            return renderTextContent(lesson.default_content);
        }

        // If variant available, render based on content type
        if (variant) {
            switch (variant.content_type) {
                case 'video':
                    return renderVideoContent(variant);
                case 'audio':
                    return renderAudioContent(variant);
                case 'pdf':
                    return renderPdfContent(variant);
                case 'text':
                    return renderTextContent(variant.content_text || lesson.default_content);
                default:
                    return renderTextContent(lesson.default_content);
            }
        }

        // Fallback to default text content
        return renderTextContent(lesson.default_content);
    };

    const renderVideoContent = (variant) => (
        <div className="content-wrapper">
            <div className="content-type-badge video">🎥 Video Lesson</div>
            {variant.content_url ? (
                <div className="video-container">
                    <video controls className="lesson-video">
                        <source src={variant.content_url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {variant.content_text && (
                        <div className="video-transcript">
                            <h4>Transcript:</h4>
                            {renderTextContent(variant.content_text)}
                        </div>
                    )}
                </div>
            ) : (
                <p className="content-unavailable">Video content is not available yet.</p>
            )}
        </div>
    );

    const renderAudioContent = (variant) => (
        <div className="content-wrapper">
            <div className="content-type-badge audio">🎧 Audio Lesson</div>
            {variant.content_url ? (
                <div className="audio-container">
                    <audio controls className="lesson-audio">
                        <source src={variant.content_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    {variant.content_text && (
                        <div className="audio-transcript">
                            <h4>Transcript:</h4>
                            {renderTextContent(variant.content_text)}
                        </div>
                    )}
                </div>
            ) : (
                <p className="content-unavailable">Audio content is not available yet.</p>
            )}
        </div>
    );

    const renderPdfContent = (variant) => (
        <div className="content-wrapper">
            <div className="content-type-badge pdf">📄 PDF Document</div>
            {variant.content_url ? (
                <div className="pdf-container">
                    <div className="pdf-info">
                        <p>Download or view the PDF document for this lesson.</p>
                        {variant.file_size_mb && (
                            <p className="file-size">File size: {variant.file_size_mb} MB</p>
                        )}
                    </div>
                    <a 
                        href={variant.content_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pdf-download-btn"
                    >
                        📥 Download PDF
                    </a>
                    <div className="pdf-viewer">
                        <iframe
                            src={variant.content_url}
                            title="Lesson PDF"
                            className="pdf-iframe"
                        />
                    </div>
                    {variant.content_text && (
                        <div className="pdf-summary">
                            <h4>Summary:</h4>
                            {renderTextContent(variant.content_text)}
                        </div>
                    )}
                </div>
            ) : (
                <p className="content-unavailable">PDF content is not available yet.</p>
            )}
        </div>
    );

    const renderTextContent = (content) => (
        <div className="content-wrapper">
            <div className="content-type-badge text">📝 Text Lesson</div>
            <div className="lesson-body">
                {content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                        <p key={index}>{paragraph}</p>
                    ) : (
                        <br key={index} />
                    )
                ))}
            </div>
        </div>
    );

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

