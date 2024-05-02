import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MyProfile.css';
import { ReactComponent as Pro } from '../svg/sell.svg';
import { ReactComponent as Bids } from '../svg/auction.svg';
import { ReactComponent as Win } from '../svg/handshake.svg';
import { ReactComponent as Cash } from '../svg/cash_receipt.svg';


const MyProfile = ({ darkMode, email }) => {
  const { userId  } = useAuth(); // Assuming you have a 'username' property in your AuthContext
  const [totalBids, setTotalBids] = useState(0);
 const [totalProducts, setTotalProducts] = useState(0);
 const [winningBids, setWinningBids] = useState(0);
 const [averageBidAmount, setAverageBidAmount] = useState(0);
 const [totalBidAmount, setTotalBidAmount] = useState(0);
 const [winningRate, setWinningRate] = useState(0);
 const [username, setUsername] = useState('');
 const [topCategories, setTopCategories] = useState([]);
  
 
 useEffect(() => {
   const fetchProfileStatistics = async () => {
     try {
      const topCategoriesResponse = await axios.get(`http://127.0.0.1:5500/api/top-categories/${userId}`);
      setTopCategories(topCategoriesResponse.data.topCategories);

      const userResponse = await axios.get(`http://127.0.0.1:5500/api/getUserByEmail/${userId}`);
      setUsername(userResponse.data.username);

       const bidsResponse = await axios.get(`http://127.0.0.1:5500/api/getTotalBids/${userId}`);
       setTotalBids(bidsResponse.data.totalBids);

       const productsResponse = await axios.get(`http://127.0.0.1:5500/api/getTotalProducts/${userId}`);
       setTotalProducts(productsResponse.data.totalProducts);

       const winningBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getWinningBids/${userId}`);
       setWinningBids(winningBidsResponse.data.winningBids);


       const userBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getUserBids/${userId}`);
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
          <h5 className={`card-text ${darkMode ? 'text-light' : ''}`}>
            <p style={{ marginLeft: "25px" }}>Email: <strong >{userId}</strong></p>
          </h5><pre></pre>
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
              <Cash width="150" height="150" />
              &#8377;{totalBidAmount}
              <span className='n-box'>Total Bid Amount: </span>
            </p>
            {/* Display top categories */}
            {topCategories.map((category, index) => (
              <p key={index} className={`card-box card ${darkMode ? 'text-light' : ''}`} >
              <Cash width="150" height="150" />
                <span>{category}</span>
                <span className='n-box'>Your Top Category #{index + 1}: </span>
              </p>
            ))}
          </div>
          <p className={`card-text ${darkMode ? 'text-light' : ''}`}>
            Winning Rate: {winningRate.toFixed(2)}%
          </p><pre></pre>
          <Link className={`my-profile-btn-primary ${darkMode ? 'btn-toggle-dark' : ''}`} to="/bidding">
            View Your Products
          </Link>&nbsp; &nbsp;
          <Link className={`my-profile-btn-primary ${darkMode ? 'btn-toggle-dark' : ''}`} to="/userBids">
            View Your Placed Bids
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 

