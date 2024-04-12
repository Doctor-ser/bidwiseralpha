import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from './AuthContext';
import './Login.css';

const LoginPage = ({ darkMode, userType, setUserType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setLoggedIn, setUserId, setUserBids, setUsername } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://127.0.0.1:5500/api/login', {
        email,
        password
      });
  
      console.log('Response:', response);
  
      if (response.data.message === 'Login successful') {
        alert('Login successful!');
        setLoggedIn(true);
        setUserId(email);
       
        setUsername(response.data.username);
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('userId', email);
        localStorage.setItem('username', response.data.username);
  
        const userBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getUserBids/${email}`);
        console.log('User Bids:', userBidsResponse.data.userBids);
  
        setUserBids(userBidsResponse.data.userBids);
  
        if (response.data.userType === 'user') {
          localStorage.getItem('userType', 'user');
          setUserType('user')
          navigate('/product');
        } else if (response.data.userType === 'admin') {
          localStorage.setItem('userType', 'admin');
          setUserType('admin')
          navigate('/admin');
          console.log('Admin logged in');
        }
        
        // // Triggering page refresh after successful login
        // onLoginSuccess();
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
  
      if (error.response && error.response.status === 401) {
        if (error.response.data.message === 'Email does not exist') {
          alert('Email does not exist.');
        } else if (error.response.data.message === 'Incorrect password') {
          alert('Incorrect password.');
        } else {
          alert('Invalid credentials. Please try again.');
        }
      } else {
        alert('An error occurred. Please try again later.');
      }
    }
  };

const handleForgotPassword = async () => {
  try {

    
    const response = await axios.post('http://127.0.0.1:5500/api/forgotPassword', { email });

    if (response.data.message === 'Email sent successfully') {
      alert('An email with the new password has been sent to your email address.');
    } else {
      console.log('1');
      alert('An error occurred. Please try again later.');
      
    }
  } catch (error) {
    console.error('Error:', error);

    if (error.response) {
      if (error.response.status === 404) {
        alert('Email not found.');
      } else if (error.response.status === 500) {
        alert('An error occurred. Please try again later.');
        console.log('2');
      }
    } else {
      alert('An error occurred. Please try again later.');
      console.log('3');
    }
  }
};
  
  

  return (
    <div className={`login-page ${darkMode ? 'dark-mode' : ''}`}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>New user? <Link to="/signup">Signup</Link></p>
      <p>  
      <span className={`forgot-password ${darkMode ? 'dark-mode' : ''}`} onClick={handleForgotPassword}>
          Forgot Password?
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
