import React, { useState } from 'react';
import axios from 'axios';
import './users.css';
import { colors } from '@mui/material';

const AdminPage = () => {
  const [email, setEmail] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userBids, setUserBids] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5500/api/getUserDetails/${email}`);
      setUserDetails(response.data.userDetails);
      setErrorMessage('');
      // Fetch bids by the user after fetching user details
      fetchUserBids();
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(null);
      setUserBids([]);
      setErrorMessage('User not found');
    }
  };

  const fetchUserBids = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5500/api/getBidsByUser/${email}`);
      setUserBids(response.data.userBids);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching user bids:', error);
      setUserBids([]);
      setErrorMessage('Failed to fetch user bids');
    }
  };

  const deleteUser = async () => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5500/api/users/${email}`);
      setUserDetails(null);
      setUserBids([]);
      setErrorMessage('');
      alert(response.data.message); // Display response message as an alert
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Failed to delete user');
    }
  };
  

  return (
    <div>
    <div className='user-det'>
      <div className='sidebar emailform'>
        <h2 className='n-tag'>Find User</h2>
        <div className='find-e'>
          <label>Search Using Email:</label>
          <input
            type="text"
            placeholder="Enter the user email"
            style={{ marginBottom: '20px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className='fet-btn' onClick={fetchUserDetails}>
            Fetch Details
          </button>
        </div>
      </div>
      {userDetails && (
        <div className='detaillisting'>
            <h2 className='n-tag' style={{color:'black', fontSize:'30px'}}>User Details</h2>
            <p><strong>Name: </strong> {userDetails.username}</p>
            <p><strong>Email: </strong>{userDetails.email}</p>
          <button onClick={deleteUser}>Delete User</button>
          {userBids.length > 0 && (
        <div className='mar1'>
          <h2 style={{textAlign:'center'}}>User Bids</h2>
          <ul className='flex1'>
            {userBids.map((bid) => (
              <li key={bid._id}>
                <div className='biddetails'>
                <p>Name: {bid.name}</p>
                <p>Description: {bid.description}</p>
                <p>Starting Bid: {bid.startingBid}</p>
                <p>Current Bid: {bid.currentBid}</p>
                </div>
                
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>
      )}
    </div>
      
      {errorMessage && <p>{errorMessage}</p>}
     
    </div>
  );
};

export default AdminPage;
