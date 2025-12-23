import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import Header from '../components/Header';
import './DashboardPage.css';

/**
 * Dashboard Page - Shows user's enrolled courses and progress
 * 
 * Features:
 * - Enrolled courses with progress bars
 * - Statistics (total enrollments, completed lessons, courses completed)
 * - Recent activity feed
 * - Quick navigation to courses and lessons
 */
function DashboardPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadDashboard();
    }, [isAuthenticated, navigate]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await dashboardAPI.getDashboard();
            setDashboard(data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage === 0) return '#ccc';
        if (percentage < 30) return '#ff9800';
        if (percentage < 70) return '#2196f3';
        if (percentage < 100) return '#4caf50';
        return '#8bc34a';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container">
                    <div className="error-state">
                        <p className="error-message">❌ {error}</p>
                        <button onClick={loadDashboard} className="retry-button">
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!dashboard) {
        return (
            <>
                <Header />
                <div className="container">
                    <p>No dashboard data available</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container dashboard-container">
                <div className="dashboard-header">
                    <h1>My Dashboard</h1>
                    <p className="welcome-message">
                        Welcome back, <strong>{dashboard.user.full_name}</strong>!
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <div className="stat-value">{dashboard.stats.total_enrollments}</div>
                            <div className="stat-label">Enrolled Courses</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{dashboard.stats.total_lessons_completed}</div>
                            <div className="stat-label">Lessons Completed</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📖</div>
                        <div className="stat-content">
                            <div className="stat-value">{dashboard.stats.courses_in_progress}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎓</div>
                        <div className="stat-content">
                            <div className="stat-value">{dashboard.stats.courses_completed}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>My Courses</h2>
                        {dashboard.enrolled_courses.length === 0 && (
                            <button 
                                onClick={() => navigate('/')} 
                                className="browse-courses-btn"
                            >
                                Browse Courses
                            </button>
                        )}
                    </div>

                    {dashboard.enrolled_courses.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't enrolled in any courses yet.</p>
                            <button 
                                onClick={() => navigate('/')} 
                                className="primary-button"
                            >
                                Explore Courses
                            </button>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {dashboard.enrolled_courses.map((course) => (
                                <div 
                                    key={course.id} 
                                    className="course-card"
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                >
                                    <div className="course-card-header">
                                        <h3>{course.title}</h3>
                                        <span className="enrolled-badge">
                                            Enrolled {formatDate(course.enrolled_at)}
                                        </span>
                                    </div>
                                    
                                    <p className="course-description">
                                        {course.description}
                                    </p>

                                    <div className="course-progress">
                                        <div className="progress-header">
                                            <span className="progress-label">Progress</span>
                                            <span className="progress-percentage">
                                                {course.progress_percentage}%
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${course.progress_percentage}%`,
                                                    backgroundColor: getProgressColor(course.progress_percentage)
                                                }}
                                            ></div>
                                        </div>
                                        <div className="progress-stats">
                                            <span>
                                                {course.completed_lessons} / {course.total_lessons} lessons
                                            </span>
                                        </div>
                                    </div>

                                    {course.progress_percentage === 100 && (
                                        <div className="completion-badge">
                                            🎉 Completed!
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Activity */}
                {dashboard.recent_activity && dashboard.recent_activity.length > 0 && (
                    <section className="dashboard-section">
                        <h2>Recent Activity</h2>
                        <div className="activity-list">
                            {dashboard.recent_activity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">✓</div>
                                    <div className="activity-content">
                                        <div className="activity-title">
                                            Completed: <strong>{activity.lesson_title}</strong>
                                        </div>
                                        <div className="activity-meta">
                                            <span className="activity-course">
                                                {activity.course_title}
                                            </span>
                                            <span className="activity-time">
                                                {formatDate(activity.completed_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="activity-goto"
                                        onClick={() => navigate(`/courses/${activity.course_id}`)}
                                    >
                                        Go to Course →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

export default DashboardPage;
