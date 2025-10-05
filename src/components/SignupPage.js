import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const SignupPage = ({ darkMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validatePassword = () => {
    // Password should contain at least 8 characters
    if (password.length < 8) {
      alert('Password must contain at least 8 characters.');
      return false;
    }
    // Password should contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      alert('Password must contain at least one uppercase letter.');
      return false;
    }
    // Password should contain at least one special character
    if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(password)) {
      alert('Password must contain at least one special character.');
      return false;
    }
    // Password should contain at least one digit
    if (!/\d/.test(password)) {
      alert('Password must contain at least one digit.');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return; // Validate password before submitting

    const obj = { username, email, password };
    const url = "https://bidwiseralpha.onrender.com/api/signup";

    try {
      const res = await axios.post(url, obj);

      if (res.status === 200) {
        sendWelcomeEmail(email);
        alert("User added successfully");
        window.location.href = "/login";
      } else {
        console.log("promise rejected");
        Promise.reject();
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Email already exists in the database.");
      } else {
        alert(err);
      }
    }
  };

  // Function to send a welcome email
  const sendWelcomeEmail = async (userEmail) => {
    const welcomeEmailUrl = "https://bidwiseralpha.onrender.com/api/sendWelcomeEmail";

    try {
      await axios.post(welcomeEmailUrl, { email: userEmail });
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  return (
    <div className={`signup-page ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="rad card-title" style={{ marginBottom: "30px", border: "none" }}>SignUp</h2>
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="my-profile-btn-primary l-bt" style={{ margin: "0px 45px", padding: "0px 105px", Color: "#333333", fontWeight: "bold" }} type="submit">Signup</button>
      </form><pre></pre>
      <p style={{ margin: "0px 60px" }}>Already have an account? <Link to="/login" className='alac'>Login</Link></p>
    </div>
  );
};

export default SignupPage;
