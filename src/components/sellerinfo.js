import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SellerInfoPage = () => {
  const { userId } = useParams(); // Extracting userId from URL parameter
  const [averageRating, setAverageRating] = useState(0);
  const [topFeedbacks, setTopFeedbacks] = useState([]);
  const [productNames, setProductNames] = useState([]);

  useEffect(() => {
    const fetchUserRatingsAndFeedbacks = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/userratings/${userId}`);
        setAverageRating(response.data.averageRating);
        setTopFeedbacks(response.data.feedbacks);
      } catch (error) {
        console.error('Error fetching user ratings and feedbacks:', error);
      }
    };

    fetchUserRatingsAndFeedbacks();
  }, [userId]);

  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        // Fetch product names associated with the userId
        const response = await axios.get(`http://127.0.0.1:5500/api/getProductNames/${userId}`);
        setProductNames(response.data.productNames);
      } catch (error) {
        console.error('Error fetching product names:', error);
      }
    };

    fetchProductNames();
  }, [userId]);

  return (
    <div>
      <h2>Seller Info</h2>
      <p>Seller Name: {userId}</p>
      <p>Average Rating for the seller: {averageRating}</p>
      <h3>Top reviews for this seller:</h3>
      <ul>
        {topFeedbacks.map((feedback, index) => (
          <li key={index}>{feedback.feedback}</li>
        ))}
      </ul>
      <h3>Products Listed by {userId}:</h3>
      <ul>
        {productNames.map((productName, index) => (
          <li key={index}>{productName}</li>
        ))}
      </ul>
    </div>
  );
};

export default SellerInfoPage;
