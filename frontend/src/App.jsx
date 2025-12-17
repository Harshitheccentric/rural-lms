import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import './App.css';

/**
 * Main App Component
 * Sets up routing for the application
 * 
 * TODO: Phase 3 - Add authentication context
 * TODO: Phase 3 - Add protected routes
 * TODO: Phase 3 - Add navigation header with login/logout
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
