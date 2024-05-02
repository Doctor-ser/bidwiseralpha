import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import './productfeedback.css';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const Productfeedback = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // Flag variable to track feedback submission
  const auth = useAuth(); // Use the useAuth hook
  const navigate = useNavigate(); // Use the useNavigate hook

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/product/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    // Check local storage for the feedbackSubmitted flag when the component mounts
    const storedFeedbackSubmitted = localStorage.getItem(`feedbackSubmitted_${productId}`);
    if (storedFeedbackSubmitted) {
      setFeedbackSubmitted(JSON.parse(storedFeedbackSubmitted));
    }
  }, [productId]);

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value));
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.loggedIn) {
      alert('Please log in to add feedback for the product.');
      // Navigate to login page
      navigate('/login');
      return;
    }

    if (feedbackSubmitted) {
      alert('Feedback already submitted for this product.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5500/api/productfeedbacks', {
        productId,
        productName: product.name,
        userId: product.userId,
        rating,
        feedback,
      });

      console.log('Feedback submitted:', response.data);
      alert('Feedback submitted successfully'); // Display success message
      // Clear form values after successful submission
      setRating(0);
      setFeedback('');
      // Set the flag to true to indicate that feedback has been submitted for this product
      setFeedbackSubmitted(true);
      // Store the feedbackSubmitted flag in local storage
      localStorage.setItem(`feedbackSubmitted_${productId}`, JSON.stringify(true));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Product Feedback</h1>
      {product && (
        <div>
          <h2 style={{ marginLeft: '20px', textAlign: 'left' }}>PRODUCT NAME: {product.name}</h2>
          <p style={{ marginLeft: '40px' }}>Product Price: {product.currentBid}</p>
          <p style={{ marginLeft: '40px' }}>SELLER MAIL: {product.userId}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="userId" value={product && product.userId} />
        <label htmlFor="rating" style={{ marginLeft: '40px' }}>Rating (out of 5):</label>
        <div className='feedback-rating'>
          <div className='feedback-commentl'>
            <input
              type="number"
              id="rating"
              name="rating"
              min="0"
              max="5"
              value={rating}
              onChange={handleRatingChange}
            />
          </div>
        </div>
        <div className="feedback-comment">
          <label htmlFor="feedback">Feedback:</label>
          <div className='feedback-commentl'>
            <textarea
              id="feedback"
              name="feedback"
              value={feedback}
              onChange={handleFeedbackChange}
            />
          </div>
        </div>
        <div className='submit-btn'>
          <button type="submit">Submit Feedback</button>
        </div>
      </form>
    </div>
  );
};

export default Productfeedback;
