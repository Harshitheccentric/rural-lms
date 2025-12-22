import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './CoursePage.css';

/**
 * Course Page - Shows course details and lesson list
 * 
 * Phase 3c: Added enrollment functionality
 * Phase 4a: Added progress tracking
 */
function CoursePage() {
    const { courseId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseAPI.getById(courseId);
            setCourse(data);

            // Load progress if enrolled (Phase 4a)
            if (data.is_enrolled) {
                await loadProgress();
            } else {
                setProgress(null);
            }
        } catch (err) {
            setError('Failed to load course. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        try {
            const progressData = await courseAPI.getProgress(courseId);
            setProgress(progressData);
        } catch (err) {
            console.error('Failed to load progress:', err);
            // Don't show error to user, progress is optional
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            setError(null);
            await courseAPI.enroll(courseId);
            // Reload course to update enrollment status and progress
            await loadCourse();
        } catch (err) {
            setError('Failed to enroll. Please try again.');
            console.error(err);
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        if (!confirm('Are you sure you want to unenroll from this course?')) {
            return;
        }

        try {
            setEnrolling(true);
            setError(null);
            await courseAPI.unenroll(courseId);
            // Reload course to update enrollment status
            await loadCourse();
        } catch (err) {
            setError('Failed to unenroll. Please try again.');
            console.error(err);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading course...</div>
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={loadCourse}>Retry</button>
                    <Link to="/" className="back-link">← Back to courses</Link>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container">
                <div className="error">
                    <p>Course not found</p>
                    <Link to="/" className="back-link">← Back to courses</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="container">
                <Link to="/" className="back-link">← Back to courses</Link>

                <header className="course-header">
                    <h1>{course.title}</h1>
                    <p className="course-description">{course.description}</p>

                    {/* Phase 3c: Enrollment UI */}
                    <div className="enrollment-section">
                        {!isAuthenticated ? (
                            <p className="enrollment-message">
                                <Link to="/login">Login</Link> to enroll in this course
                            </p>
                        ) : course.is_enrolled ? (
                            <>
                                {/* Phase 4a: Progress indicator */}
                                {progress && (
                                    <div className="progress-indicator">
                                        <div className="progress-text">
                                            <strong>{progress.completed_lessons} / {progress.total_lessons}</strong> lessons completed
                                            <span className="progress-percentage"> ({progress.percentage}%)</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleUnenroll}
                                    disabled={enrolling}
                                    className="unenroll-button"
                                >
                                    {enrolling ? 'Processing...' : 'Unenroll'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="enroll-button"
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                            </button>
                        )}
                    </div>

                    {error && course && (
                        <div className="error-message">{error}</div>
                    )}
                </header>

                <section className="lessons-section">
                    <h2>Lessons ({course.lessons?.length || 0})</h2>

                    {!course.lessons || course.lessons.length === 0 ? (
                        <p className="no-lessons">No lessons available yet.</p>
                    ) : (
                        <div className="lesson-list">
                            {course.lessons.map((lesson, index) => (
                                <Link
                                    key={lesson.id}
                                    to={`/lessons/${lesson.id}`}
                                    className="lesson-item"
                                >
                                    <div className="lesson-number">{index + 1}</div>
                                    <div className="lesson-info">
                                        <h3>{lesson.title}</h3>
                                        <p className="lesson-preview">
                                            {lesson.content.substring(0, 100)}...
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

export default CoursePage;
