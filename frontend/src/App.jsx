import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

/**
 * Main App Component
 * Sets up routing and authentication context
 * 
 * TODO: Phase 4 - Add protected routes
 * TODO: Phase 4 - Add role-based route guards
 * TODO: Phase 4 - Add 404 page
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route path="/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
