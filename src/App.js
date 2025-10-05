import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css'; // Add this line for general styles
import HomePage from './components/HomePage';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage'; 
import Navbar from './components/Navbar';
import Naavbar from './admin/navbar';
import ProductPage from "./components/ProductPage"
import BiddingPage from './components/BiddingPage';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import Fouter from './admin/footer';
import UserBidsPage from './components/UserBidsPage';
import MyProfile from './components/MyProfile';
import Chat from './components/Chat';
import Feedback from './components/feedback';
import ProductFeedback from './components/productfeedback';
import SellerInfo from './components/sellerinfo';
import AdminPage from './admin/adminpage';  
import ProductsPage from './admin/productpage';  
import Userpage from './admin/users';
import Feedbackadmin from './admin/fetchfeedback';
import ProductDetails from './components/productdetails';
const io  = require('socket.io-client');

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loadMessage, setLoadMessage] = useState(false);
  const [bidChange, setBidChange] = useState(false);
  const [userType,setUserType] = useState('user');
  
  const { email } = useAuth(); // Get the user's email from useAuth
  const socket = io('http://localhost:5500');
  socket.on('connect', () => { console.log("Connected to server"); });
  socket.on('new-message',()=>{
    setLoadMessage(prev => !prev);
  })

  //on user bid change
  socket.on('userBidChange',()=>{
    setBidChange(prev => !prev)
  })

  socket.on('bidChange',()=>{
    console.log('changed')
    setBidChange(prev => !prev)
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Determine if the current route is an admin route

  useEffect(() => {
    const user_type = localStorage.getItem('userType') || 'user';
    setUserType(user_type);
  })
  
  // const currentPath = window.location.pathname;
  // let navbarComponent;
  // let footerComponent;

  // if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup' || currentPath === '/product' || currentPath === '/userBids' || currentPath === '/bidding' || currentPath === '/about' || currentPath === '/my-profile' || currentPath === '/feedback' || currentPath === '/productfeedback/:productId' || currentPath === '/sellerinfo/:userId' || currentPath === '/chat/:productId') {
  //   navbarComponent = <Navbar />;
  //   footerComponent = <Footer />;
  // } else {
  //   navbarComponent = <Naavbar />;
  //   footerComponent = <Fouter />;
  // }
  return (

    <Router>
      <AuthProvider userType={userType} setUserType={setUserType}>
        {userType == 'user'? <Navbar setUserType={setUserType} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/> : <Naavbar setUserType={setUserType} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} />} />
          <Route path="/login" element={<LoginPage darkMode={darkMode}  userType={userType} setUserType={setUserType}/>} />
          <Route path="/signup" element={<SignupPage  darkMode={darkMode}/>} />
          <Route path="/product" element={<ProductPage darkMode={darkMode} bidChange={bidChange} email={email} />} />
          <Route path="/userBids" element={<UserBidsPage darkMode={darkMode} email={email}/>} />
          <Route path="/bidding" element={<BiddingPage  darkMode={darkMode}/>} />
          <Route path="/aboutus" element={<AboutUs  darkMode={darkMode}/>} />
          <Route path="/my-profile" element={<MyProfile darkMode={darkMode} email={email} />} />
          <Route path="/feedback" element={<Feedback darkMode={darkMode} email={email} />} />
          <Route path="/productfeedback/:productId" element={<ProductFeedback darkMode={darkMode} email={email} />} />
          <Route path="/sellerinfo/:userId" element={<SellerInfo darkMode={darkMode} email={email} />} />
          <Route path="/chat/:productId" element={<Chat darkMode={darkMode} loadMessage={loadMessage} setLoadMessage={setLoadMessage} email={email} />} />
          <Route path="/admin" element={<AdminPage darkMode={darkMode} email={email} />} />
          <Route path="/admin/products" element={<ProductsPage darkMode={darkMode} email={email}  bidChange={bidChange}/>} />
          <Route path="/admin/users" element={<Userpage darkMode={darkMode} email={email} />} />
          <Route path="/admin/feedbacks" element={<Feedbackadmin darkMode={darkMode} email={email} />} />
          <Route path="/products/:productId" element={<ProductDetails darkMode={darkMode} email={email} bidChange={bidChange} />} />
        </Routes>
        {/* Conditionally render the Footer */}
        {userType == 'user'? <Footer/> : <Fouter/>}   
      </AuthProvider>
    </Router>
  );
};

export default App;