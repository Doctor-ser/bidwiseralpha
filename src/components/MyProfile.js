import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MyProfile.css';
import { ReactComponent as Pro } from '../svg/sell.svg';
import { ReactComponent as Bids } from '../svg/auction.svg';
import { ReactComponent as Win } from '../svg/handshake.svg';
import { ReactComponent as Cash } from '../svg/cash_receipt.svg';
import { ReactComponent as Cat } from '../svg/sorting.svg';
import { ReactComponent as Tot } from '../svg/total_sales.svg';
import { CircularProgressbar } from 'react-circular-progressbar';
import './styles.css';


const ChangePasswordForm = ({ userId, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const validatePassword = () => {
    // Password should contain at least 8 characters
    if (newPassword.length < 8) {
      alert('Password must contain at least 8 characters.');
      return false;
    }
    // Password should contain at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      alert('Password must contain at least one uppercase letter.');
      return false;
    }
    // Password should contain at least one special character
    if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(newPassword)) {
      alert('Password must contain at least one special character.');
      return false;
    }
    // Password should contain at least one digit
    if (!/\d/.test(newPassword)) {
      alert('Password must contain at least one digit.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    try {
      if (!validatePassword()) return;
      const response = await axios.post('https://bidwiser.onrender.com/api/changePassword', {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      if (response.message ==='invalid password'){
        alert('Invalid password');
      }
      if (response.status === 200) {
        alert('Password changed successfully');
        onClose(); // Close the form after successful password change
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Wrong Password');
    }
  };

  return (
    <div class="modal" style={{display:"block"}}>
    <div className="modal-dialog change-password-form dx">
      <span class="modal-content dx1">
      <button type="button" class="btn-close" onClick={onClose}></button>
        <h2>Change Password</h2>
        <span className='new-pass'>
          <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button className='btn-p cart px-auto'style={{marginTop:"40px"}} onClick={handleChangePassword}>Change Password</button>
        </span>
      </span>
    </div>
    </div>
  );
};

const MyProfile = ({ darkMode, email }) => {
  const { userId  } = useAuth(); // Assuming you have a 'username' property in your AuthContext
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [totalBids, setTotalBids] = useState(0);
 const [totalProducts, setTotalProducts] = useState(0);
 const [winningBids, setWinningBids] = useState(0);
 const [averageBidAmount, setAverageBidAmount] = useState(0);
 const [totalBidAmount, setTotalBidAmount] = useState(0);
 const [winningRate, setWinningRate] = useState(0);
 const [username, setUsername] = useState('');
 const [topCategories, setTopCategories] = useState([]);

 const handleOpenChangePasswordForm = () => {
  setShowChangePasswordForm(true);
};

const handleCloseChangePasswordForm = () => {
  setShowChangePasswordForm(false);
};
  
 
 useEffect(() => {
   const fetchProfileStatistics = async () => {
     try {
      const topCategoriesResponse = await axios.get(`https://bidwiser.onrender.com/api/top-categories/${userId}`);
      setTopCategories(topCategoriesResponse.data.topCategories);

      const userResponse = await axios.get(`https://bidwiser.onrender.com/api/getUserByEmail/${userId}`);
      setUsername(userResponse.data.username);

       const bidsResponse = await axios.get(`https://bidwiser.onrender.com/api/getTotalBids/${userId}`);
       setTotalBids(bidsResponse.data.totalBids);

       const productsResponse = await axios.get(`https://bidwiser.onrender.com/api/getTotalProducts/${userId}`);
       setTotalProducts(productsResponse.data.totalProducts);

       const winningBidsResponse = await axios.get(`https://bidwiser.onrender.com/api/getWinningBids/${userId}`);
       setWinningBids(winningBidsResponse.data.winningBids);


       const userBidsResponse = await axios.get(`https://bidwiser.onrender.com/api/getUserBids/${userId}`);
       const userBids = userBidsResponse.data.userBids;
       
       // Calculate average bid amount
       const totalBidAmount = userBids.reduce((sum, bid) => sum + bid.bidAmount, 0);
       setTotalBidAmount(totalBidAmount);
       const averageBid = totalBids > 0 ? totalBidAmount / totalBids : 0;
       setAverageBidAmount(averageBid);

       // Calculate winning rate
       const rate = totalBids > 0 ? (winningBids / totalBids) * 100 : 0;
       setWinningRate(rate);

     } catch (error) {
       console.error('Error fetching profile statistics:', error);
     }
   };

   fetchProfileStatistics();
 }, [userId,totalBids,winningBids]);

  return (
      <div className={`my-profile-container mt-5 ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`my-profile-card ${darkMode ? 'text-light bg-dark' : ''}`}>
        <div className="card-body card-fl">
          <div className='tt1 t2'>
            <h2 className={`card-title  ${darkMode ? 'text-light' : ''}`}><text className='tt' style={{fontSize :"50px"}}>Welcome, </text><strong >{username}</strong>!</h2>
          </div>
          <h5 className={`card-text tc1 ${darkMode ? 'text-light' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ padding: "50px 0px 40px 25px" }}>Email: <strong>{userId}</strong></p>
              <button className='btn-p cart px-auto cx' style={{marginRight:"50px"}} onClick={handleOpenChangePasswordForm}>Change Password</button>
            </span>
          </h5><pre></pre>
          {/* Render change password form if showChangePasswordForm is true */}
          {showChangePasswordForm && <ChangePasswordForm userId={userId} onClose={handleCloseChangePasswordForm} />}

          <div className="card-row">
            <p className={`card-box card ${darkMode ? 'text-light' : ''}`}>
              <Bids width="150" height="150" />
              {totalBids}
              <span className='n-box'>Total Bids Placed</span>
            </p>
            <p className={`card-box card ${darkMode ? 'text-light' : ''}`}>
              <Pro width="150" height="150" />
              {totalProducts}
              <span className='n-box'>Total Products Listed: </span>
            </p>
            <p className={`card-box card ${darkMode ? 'text-light' : ''}`}>
              <Win width="150" height="150" />
              {winningBids}
              <span className='n-box'>Winning Bids: </span>
            </p>
            <p className={`card-box card ${darkMode ? 'text-light' : ''}`} >
              <Cash width="150" height="150" />
              &#8377;{averageBidAmount.toFixed(2)}
              <span className='n-box'>Average Bid Amount: </span>
            </p>
            <p className={`card-box card ${darkMode ? 'text-light' : ''}`} >
              <Tot width="150" height="150" />
              &#8377;{totalBidAmount}
              <span className='n-box'>Total Bid Amount: </span>
            </p>
            {topCategories.length > 0 ? (
              topCategories.map((category, index) => (
                <p className={`card-box card ${darkMode ? 'text-light' : ''}`} key={index}>
                  <Cat width="150" height="150" />
                  <span>{category}</span>
                  <span className='n-box'>Favorite Category:</span>
                </p>
              ))
            ) : (
               <a href="/product" className={`card-box card ${darkMode ? 'text-light' : ''}`} >
                <Cat width="150" height="150" />
                <span>Bid here to get started</span>
                <span className='n-box'>Favorite Category:</span>
              </a>
            )}
          </div>
          <h5 className={`card-text tc ${darkMode ? 'text-light' : ''}`}style={{ margin:"0px 0px 35px 25px" }}>
            Winning Rate
          </h5><pre></pre>
          <div className="progress-container">
            <CircularProgressbar className='pi' value={winningRate.toFixed(2)} text={`${winningRate.toFixed(2)}%`} />
            <svg className='sv'>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ba28ff" />
                <stop offset="100%" stop-color="#604eff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="links-container">
            <Link className={`my-profile-btn-primary ${darkMode ? 'btn-toggle-dark' : ''}`} to="/bidding">
              &nbsp;&nbsp;&nbsp;&nbsp;View Your Products&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Link><br/><br/>
            <Link className={`my-profile-btn-primary ${darkMode ? 'btn-toggle-dark' : ''}`} to="/userBids">
            &nbsp;&nbsp;&nbsp;View Your Placed Bids&nbsp;&nbsp;&nbsp;
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 

