import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import Footer from './footer';

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
    
      <h1>Admin Page</h1>
      <div>
        <label>Email:</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={fetchUserDetails}>Fetch Details</button>
      </div>
      {userDetails && (
        <div>
          <h2>User Details</h2>
          <p>Name: {userDetails.username}</p>
          <p>Email: {userDetails.email}</p>
          <button onClick={deleteUser}>Delete User</button>
        </div>
      )}
      {userBids.length > 0 && (
        <div>
          <h2>User Bids</h2>
          <ul>
            {userBids.map((bid) => (
              <li key={bid._id}>
                <p>Name: {bid.name}</p>
                <p>Description: {bid.description}</p>
                <p>Starting Bid: {bid.startingBid}</p>
                <p>Current Bid: {bid.currentBid}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {errorMessage && <p>{errorMessage}</p>}
     
    </div>
  );
};

export default AdminPage;
