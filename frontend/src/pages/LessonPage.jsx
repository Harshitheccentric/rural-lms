import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonAPI } from '../services/api';
import Header from '../components/Header';
import './LessonPage.css';

/**
 * Lesson Page - Shows lesson content
 * 
 * TODO: Phase 3 - Add "Mark as Complete" button
 * TODO: Phase 3 - Add previous/next lesson navigation
 * TODO: Phase 3 - Track reading progress
 * TODO: Phase 3 - Add AI summary feature (future)
 */
function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadLesson();
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await lessonAPI.getById(lessonId);
            setLesson(data);
        } catch (err) {
            setError('Failed to load lesson. Please try again.');
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
