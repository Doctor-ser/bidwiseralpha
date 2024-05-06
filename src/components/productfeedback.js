import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './productfeedback.css';
import { useAuth } from './AuthContext';
import RatingReview from './star.jsx';
import { border, borderRadius, height, lineHeight, textTransform, width } from '@mui/system';


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
    <div className='feedback-container'>
      <div class="feedback-form card feed-c" style={{margin:"0px", padding: "0px", border: "none", height:"600px"}}><h2 class="card-title ch-t" style={{marginBottom:" 0px", border:"none"}}>Product Feedback</h2>
        <span style={{ border: "3px solid #333333",borderTop:"none",height:"600px",lineHeight:"27px"}}>
          <p className='fe-from'>
              {product && (
                <span>
                  <p>Product Name &nbsp; :&nbsp; <strong style={{textTransform:"uppercase"}}>{product.name}</strong></p>
                  <p>Product Price &nbsp;&nbsp; :&nbsp; <strong>{product.currentBid}</strong></p>
                  <p>Seller Mail &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :&nbsp; <strong style={{textTransform:"uppercase"}}>{product.userId}</strong></p>
                </span>
              )}

              {/* Check if existing feedback exists */}
              {existingFeedback ? (
                <span>            
                  <p>Feedback &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :&nbsp; <strong style={{textTransform:"uppercase"}}>{existingFeedback[0].feedback}</strong></p>
                  <p style={{marginLeft:"213px",marginBottom:"0px", marginTop:"30px"}}>Product Rating</p>
                  <p style={{marginLeft:"160px"}}><RatingReview rating={existingFeedback[0].rating}/></p>
                  <p>
                  <button onClick={handleUpdateFeedback} style={{margin:"0px 157px 0px 142px", width:"250px"}} className='btn btn-primary1' type="submit">Update Feedback</button>
                  </p>
                </span>
                
              ) : (
                <form onSubmit={handleSubmit}>
                      <input type="hidden" name="userId" value={product && product.userId} />
                      <p style={{display:"flex",alignItems: "center"}} htmlFor="rating">Rating&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;
                            <input style={{width:"400px",border:"1px solid #dddddd"}}
                              type="number"
                              id="rating"
                              name="rating"
                              min="0"
                              max="5"
                              value={rating}
                              onChange={handleRatingChange}
                            />
                      </p>
                        <p htmlFor="feedback">Comment &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;
                          <textarea style={{width:"395px",height:"70px",border:"1px solid #dddddd",borderRadius:"5px"}}
                            id="feedback"
                            name="feedback"
                            value={feedback}
                            onChange={handleFeedbackChange}
                          />
                          </p>
                      <>
                        <button style={{margin:"0px 157px", width:"200px"}} className='btn btn-primary1' type="submit">Submit</button>
                      </>
                </form>
              )}
          </p>
          {/* Render update form if showUpdateForm is true */}
          {showUpdateForm && (
          <div class="modal" style={{display:"block"}}>
            <div className="modal-dialog change-password-form ff1">
              <span class="modal-content ff" style={{padding:"50px"}}>
                <form onSubmit={handleUpdateSubmit}>
                  {/* Add input fields for rating and feedback */}
                  <label htmlFor="rating"  style={{marginTop:"30px"}}>Rating:</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={handleRatingChange}
                  />
                  <label htmlFor="feedback" style={{marginTop:"30px"}}>Feedback:</label>
                  <textarea style={{marginTop:"3px",width:"357px", border:"1px solid black"}}
                    id="feedback"
                    name="feedback"
                    value={feedback}
                    onChange={handleFeedbackChange}
                  />
                  <div >
                    <button style={{margin:"30px 80px",width:"200px" ,  display: 'block' }} className='btn btn-primary1' type="submit">Update</button>
                  </div>
                </form>
              </span>
            </div>
          </div>
          )}
        </span>
    </div>
  </div>
  );
};

export default Productfeedback;

