import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const SignupPage = ({ darkMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
  
    const obj = { username, email, password };
    //console.log(obj);
    const url = "http://127.0.0.1:5500/api/signup";
    
  
    try {
      
      const res = await axios.post(url,obj);
     
      if (res.status === 200) {
        sendWelcomeEmail(email);
        alert("User added successfully");
        window.location.href = "/login";
      } else {
        console.log("promise rejected")
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
    const welcomeEmailUrl = "http://127.0.0.1:5500/api/sendWelcomeEmail"; // Create this endpoint on your server

    try {
      await axios.post(welcomeEmailUrl, { email: userEmail });
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };


  return (
    <div className={`signup-page ${darkMode ? 'dark-mode' : ''}`}>
      <h2 class="rad card-title " style={{marginBottom: "30px", border: "none"}}>SignUp</h2>
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
        <button className="my-profile-btn-primary l-bt" style={{margin:"0px 45px", padding:"0px 105px",Color:"#333333",fontWeight:"bold"}} type="submit">Signup</button>
      </form><pre></pre>
      <p style={{margin:"0px 60px"}}>Already have an account? <Link to="/login" className='alac' style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>Login</Link></p> {/* Link to Login Page */}
    </div>
  );
};

export default SignupPage;
