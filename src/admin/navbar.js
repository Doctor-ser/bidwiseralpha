import React from 'react';
import { useAuth } from '../components/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { blue } from '@mui/material/colors';
// Optional: Import a styled component for the MoonSVG if you have one

const MoonSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 384 512">
    <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
  </svg>
);

const AdminNavbar = ({ darkMode, toggleDarkMode,setUserType }) => {
  const navigate = useNavigate();
  const { loggedIn, setLoggedIn, setUserId } = useAuth(); // Assuming you have an AuthContext

  const handleLogout = () => {
    // Clear user credentials from local storage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.setItem('userType','user')
    setUserType('user')


    // Reset context state
    setLoggedIn(false);
    setUserId(null);

    // Redirect to the home page (or adjust as needed for admin logout)
    navigate('/');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        
      <Link className="navbar-brand" to="/admin" style={{ color: 'black', fontWeight: 'bold', fontSize: '2rem',marginLeft: 'none' }}>
    Admin Panel
</Link>

     
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="adminNavbar">
          <ul className="navbar-nav">
          <li className="nav-item">
              <Link className="nav-link" to="/admin">
                My Profile
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/products">
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">
                Users
              </Link>
            </li>
            
            <li className="nav-item">
              <Link className="nav-link" to="/admin/feedbacks">
                View Feedbacks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={handleLogout}>
                Logout
              </Link>
            </li>
            <li className="nav-item-dark">
              <button className="btn btn-sm" onClick={toggleDarkMode} style={{ backgroundColor: 'transparent', border: 'none' }}>
                {/* Replace with MoonSVG component or inline SVG code */}
                {darkMode ? <MoonSVG /> : ''}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

