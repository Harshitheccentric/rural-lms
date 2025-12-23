import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './HomePage.css';

/**
 * Home Page - Lists all available courses
 * Enhanced with course stats and progress tracking
 */
function HomePage() {
    const { isAuthenticated } = useAuth();
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

    // Helper function to determine difficulty based on lesson count
    const getDifficulty = (lessonCount) => {
        if (lessonCount <= 3) return { level: 'Beginner', className: 'beginner' };
        if (lessonCount <= 7) return { level: 'Intermediate', className: 'intermediate' };
        return { level: 'Advanced', className: 'advanced' };
    };

    // Helper function to calculate estimated time
    const getEstimatedTime = (lessonCount) => {
        const minutes = lessonCount * 15;
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMin = minutes % 60;
        return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
    };

    // Helper function to get category color
    const getCategoryColor = (category) => {
        const colors = {
            'Web Development': 'blue',
            'Computer Skills': 'green',
            'Language': 'purple',
            'Math': 'orange',
            'Science': 'red',
            'General': 'gray'
        };
        return colors[category] || 'gray';
    };

    // Helper function for progress level
    const getProgressLevel = (percentage) => {
        if (percentage === 0) return 'not-started';
        if (percentage < 50) return 'in-progress';
        if (percentage < 100) return 'almost-done';
        return 'completed';
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
        <>
            <Header />
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
                            {courses.map((course) => {
                                const difficulty = getDifficulty(course.lesson_count);
                                const estimatedTime = getEstimatedTime(course.lesson_count);
                                const categoryColor = getCategoryColor(course.category);

                                return (
                                    <Link
                                        key={course.id}
                                        to={`/courses/${course.id}`}
                                        className="course-card"
                                    >
                                        <div className="card-header">
                                            <h3>{course.title}</h3>
                                            <span className={`difficulty-badge ${difficulty.className}`}>
                                                {difficulty.level}
                                            </span>
                                        </div>

                                        <p className="course-description">{course.description}</p>

                                        {course.category && (
                                            <div className="course-tags">
                                                <span className={`category-tag ${categoryColor}`}>
                                                    {course.category}
                                                </span>
                                            </div>
                                        )}

                                        <div className="course-stats">
                                            <div className="stat-item">
                                                <span className="stat-icon">📚</span>
                                                <span>{course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-icon">⏱️</span>
                                                <span>{estimatedTime}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-icon">👥</span>
                                                <span>{course.enrollment_count} enrolled</span>
                                            </div>
                                        </div>

                                        {isAuthenticated && course.is_enrolled && (
                                            <div className="course-progress-section">
                                                <div className="progress-info">
                                                    <span className="progress-label">Your Progress</span>
                                                    <span className="progress-percentage">
                                                        {course.progress_percentage}%
                                                    </span>
                                                </div>
                                                <div className="progress-bar-container">
                                                    <div 
                                                        className={`progress-bar-fill ${getProgressLevel(course.progress_percentage)}`}
                                                        style={{ width: `${course.progress_percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

export default HomePage;
