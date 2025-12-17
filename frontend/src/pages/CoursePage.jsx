import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import './CoursePage.css';

/**
 * Course Page - Shows course details and lesson list
 * 
 * TODO: Phase 3 - Add enroll/unenroll button
 * TODO: Phase 3 - Show enrollment status
 * TODO: Phase 3 - Track lesson completion progress
 */
function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseAPI.getById(courseId);
            setCourse(data);
        } catch (err) {
            setError('Failed to load course. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading course...</div>
            </div>
        );
    }

    if (error) {
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
        <div className="container">
            <Link to="/" className="back-link">← Back to courses</Link>

            <header className="course-header">
                <h1>{course.title}</h1>
                <p className="course-description">{course.description}</p>
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
    );
}

export default CoursePage;
