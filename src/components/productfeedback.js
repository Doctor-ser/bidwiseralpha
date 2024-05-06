import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './productfeedback.css';
import { useAuth } from './AuthContext';

const Productfeedback = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  // const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null); // State to store existing feedback
  const [showUpdateForm, setShowUpdateForm] = useState(false); // State to track whether to show the update form
  const auth = useAuth();
  const navigate = useNavigate();

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

  // useEffect(() => {
  //   // Check local storage for the feedbackSubmitted flag when the component mounts
  //   const storedFeedbackSubmitted = localStorage.getItem(`feedbackSubmitted_${productId}`);
  //   if (storedFeedbackSubmitted) {
  //     setFeedbackSubmitted(JSON.parse(storedFeedbackSubmitted));
  //   }
  // }, [productId]);

  useEffect(() => {
    const fetchProductFeedback = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/productfeedbacksfetch/${productId}`);
        if (response.data) {
          // Extract rating and feedback from response data and set in state
          setExistingFeedback(response.data);
        } else {
          setExistingFeedback([]); // Set to empty array if no feedback found
        }
      } catch (error) {
        console.error('Error fetching product feedback:', error);
      }
    };
  
    fetchProductFeedback();
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
      navigate('/login');
      return;
    }

    // if (feedbackSubmitted) {
    //   alert('Feedback already submitted for this product.');
    //   return;
    // }

    try {
      const response = await axios.post('http://127.0.0.1:5500/api/productfeedbacks', {
        productId,
        productName: product.name,
        userId: product.userId,
        rating,
        feedback,
      });

      console.log('Feedback submitted:', response.data);
      alert('Feedback submitted successfully');
      setRating(0);
      setFeedback('');
      //setFeedbackSubmitted(true);
      //localStorage.setItem(`feedbackSubmitted_${productId}`, JSON.stringify(true));
      window.location.reload();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
  
    if (!auth.loggedIn) {
      alert('Please log in to update feedback for the product.');
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.put(`http://127.0.0.1:5500/api/productfeedbacks/${productId}`, {
        rating,
        feedback,
      });
      if(response.data){
        //console.log('Feedback updated:', response.data);
      alert('Feedback updated successfully');
      setRating(0);
      setFeedback('');
      setShowUpdateForm(false); // Hide the update form after submitting
      window.location.reload();
      }
      else{
        alert('Feedback not updated');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleUpdateFeedback = () => {
    setShowUpdateForm(true);
    // Check if existingFeedback is an array and has at least one element
    if (existingFeedback && Array.isArray(existingFeedback) && existingFeedback.length > 0) {
      // Set the rating and feedback in state based on the first element of existingFeedback array
      setRating(existingFeedback[0].rating);
      setFeedback(existingFeedback[0].feedback);
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

      {/* Check if existing feedback exists */}
      {existingFeedback ? (
        <div>
          <h3>Existing Feedback</h3>
          <p>Rating: {existingFeedback[0].rating}</p>
          <p>Feedback: {existingFeedback[0].feedback}</p>
          {/* Render update button */}
          <button onClick={handleUpdateFeedback}>Update Feedback</button>
        </div>
      ) : (
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
      )}

      {/* Render update form if showUpdateForm is true */}
      {showUpdateForm && (
  <form onSubmit={handleUpdateSubmit}>
    {/* Add input fields for rating and feedback */}
    <label htmlFor="rating">Rating (out of 5):</label>
    <input
      type="number"
      id="rating"
      name="rating"
      min="0"
      max="5"
      value={rating}
      onChange={handleRatingChange}
    />
    <label htmlFor="feedback">Feedback:</label>
    <textarea
      id="feedback"
      name="feedback"
      value={feedback}
      onChange={handleFeedbackChange}
    />
    <button type="submit" style={{ display: 'block' }}>Update </button>
  </form>
)}
    </div>
  );
};

export default Productfeedback;

