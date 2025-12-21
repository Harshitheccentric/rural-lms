import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './LessonPage.css';

/**
 * Lesson Page - Shows lesson content
 * 
 * Phase 3c: Added authorization checks (authentication + enrollment)
 * 
 * TODO: Phase 4 - Add "Mark as Complete" button
 * TODO: Phase 4 - Add previous/next lesson navigation
 * TODO: Phase 4 - Track reading progress
 * TODO: Phase 4 - Add AI summary feature
 */
function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notEnrolled, setNotEnrolled] = useState(false);

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

    if (error) {
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

                <article className="lesson-content">
                    <header className="lesson-header">
                        <p className="course-title">{lesson.course_title}</p>
                        <h1>{lesson.title}</h1>
                    </header>

                    <div className="lesson-body">
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
