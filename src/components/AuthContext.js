import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children, userType, setUserType }) => {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('loggedIn') === 'true' || false
  );
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const [userBids, setUserBids] = useState([]);

  const sessionTimeoutRef = useRef(null);

  const resetSessionTimeout = () => {
    clearTimeout(sessionTimeoutRef.current);
    sessionTimeoutRef.current = setTimeout(() => {
      setLoggedIn(false);
      setUserId(null);
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userId');
      alert('Session expired. Please login again.');
      window.location.href = '/login';
    }, 300000); // 5 minutes in milliseconds
  };

  const handleUserActivity = () => {
    resetSessionTimeout();
  };

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('loggedIn') === 'true' || false;
    const storedUserId = localStorage.getItem('userId') || null;
    setLoggedIn(storedLoggedIn);
    setUserId(storedUserId);

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [userType]);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || '');
  }, [loggedIn, username]);

  useEffect(() => {
    resetSessionTimeout();
    return () => {
      clearTimeout(sessionTimeoutRef.current);
    };
  }, [loggedIn]);

  return (
    <AuthContext.Provider
      value={{ loggedIn, setLoggedIn, userId, setUserType, setUserId, userBids, userType, setUserBids, username, setUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
