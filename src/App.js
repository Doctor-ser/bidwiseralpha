import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css'; // Add this line for general styles
import HomePage from './components/HomePage';
import { AuthProvider,useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage'; 
import Navbar from './components/Navbar';
import ProductPage from "./components/ProductPage"
import BiddingPage from './components/BiddingPage';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import UserBidsPage from './components/UserBidsPage';
import MyProfile from './components/MyProfile';
import { useParams } from 'react-router-dom';
import Chat from './components/Chat';
import Feedback from './components/feedback';
import ProductFeedback from './components/productfeedback';
import SellerInfo from './components/sellerinfo';
const io  = require('socket.io-client');





const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loadMessage,setLoadMessage] = useState(false);
  const { email } = useAuth(); // Get the user's email from useAuth
  const socket = io('http://localhost:5500');
  socket.on('connect', () => { console.log("Connected to server"); });
  socket.on('new-message',()=>{
    // alert("nigga")
    setLoadMessage(prev => !prev);
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  
  return (
    <Router>
      <AuthProvider>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} />} />
          <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
          <Route path="/signup" element={<SignupPage  darkMode={darkMode}/>} />
          <Route path="/product" element={<ProductPage darkMode={darkMode} email={email} />} />
          <Route path="/userBids" element={<UserBidsPage darkMode={darkMode} email={email}/>} />
          <Route path="/bidding" element={<BiddingPage  darkMode={darkMode}/>} />
          <Route path="/aboutus" element={<AboutUs  darkMode={darkMode}/>} />
          <Route path="/my-profile" element={<MyProfile darkMode={darkMode} email={email} />} />
          <Route path="/feedback" element={<Feedback darkMode={darkMode} email={email} />} />
          <Route path="/productfeedback/:productId" element={<ProductFeedback darkMode={darkMode} email={email} />} />
          <Route path="/sellerinfo/:userId" element={<SellerInfo darkMode={darkMode} email={email} />} />
          <Route path="/chat/:productId" element={<Chat darkMode={darkMode} loadMessage={loadMessage} setLoadMessage={setLoadMessage} email={email} />} />
        </Routes>
        <Footer darkMode={darkMode} />
      </AuthProvider>
    </Router>
  );
};

export default App;
