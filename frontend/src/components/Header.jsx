import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header Component
 * Shows navigation and authentication status
 * 
 * TODO: Phase 4 - Add user dropdown menu
 * TODO: Phase 4 - Add notifications
 * TODO: Phase 4 - Add search functionality
 */
function Header() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <h1>Rural LMS</h1>
                </Link>

                <nav className="header-nav">
                    {isAuthenticated ? (
                        <div className="header-auth">
                            <span className="header-user">
                                Welcome, {user?.full_name}
                            </span>
                            <button onClick={logout} className="header-logout">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="header-auth">
                            <Link to="/login" className="header-link">
                                Login
                            </Link>
                            <Link to="/register" className="header-button">
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
