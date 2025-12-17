import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import './HomePage.css';

/**
 * Home Page - Lists all available courses
 * 
 * TODO: Phase 3 - Add search/filter functionality
 * TODO: Phase 3 - Add pagination
 * TODO: Phase 3 - Show enrollment status for logged-in users
 */
function HomePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseAPI.getAll();
            setCourses(data);
        } catch (err) {
            setError('Failed to load courses. Please make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={loadCourses}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="page-header">
                <h1>Rural LMS</h1>
                <p className="subtitle">Text-first learning for everyone</p>
            </header>

            <section className="courses-section">
                <h2>Available Courses</h2>

                {courses.length === 0 ? (
                    <p className="no-courses">No courses available yet.</p>
                ) : (
                    <div className="course-grid">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/courses/${course.id}`}
                                className="course-card"
                            >
                                <h3>{course.title}</h3>
                                <p className="course-description">{course.description}</p>
                                <div className="course-meta">
                                    <span className="lesson-count">
                                        📚 {course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default HomePage;
