import React, { useState, useEffect } from 'react';
import './feedback.css';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import { useNavigate } from 'react-router-dom';
import RatingStar from "./RatingStar" // add you floder path properly


const FeedbackForm = ({ darkMode }) => {
    const auth = useAuth();
    const { userId, loggedIn } = useAuth(); // Get userId and loggedIn status from useAuth hook
    const navigate = useNavigate(); // Import useNavigate hook for navigation

    const [feedback, setFeedback] = useState({ rating: '', comment: '' });
    const [averageRating, setAverageRating] = useState(null);
    const [topRatedComments, setTopRatedComments] = useState([]);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        // Fetch average rating when component mounts
        fetchAverageRating();
        fetchTopRatedComments(); // Fetch top-rated comments when component mounts
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Validate input for rating to be between 0 and 5
        if (name === 'rating' && (value < 0 || value > 5)) {
            return; // Do not update state if input is invalid
        }

        setFeedback({ ...feedback, [name]: value });
    };

    const [rating, setRating] = useState(0)

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!auth.loggedIn) {
          alert('Please log in to submit feedback.');
          navigate('/login'); // Redirect to login page
          return;
      }
      try {
          // Use userId obtained from useAuth
          console.log('Submitting feedback:', feedback);
          await axios.post('https://bidwiser.onrender.com/api/feedback', { ...feedback, userId });
          alert('Feedback submitted successfully');
          setFeedback({ rating: '', comment: '' });
          // Fetch average rating again after submitting feedback
          fetchAverageRating();
          // Reload the page to display updated top-rated comments
          window.location.reload();
      } catch (error) {
          console.error('Error submitting feedback:', error);
          alert('Failed to submit feedback. Please try again later.');
      }
  };
  
    
    const fetchAverageRating = async () => {
        try {
            // Fetch average rating from server
            const response = await axios.get('https://bidwiser.onrender.com/api/feedback/average');
            setAverageRating(response.data.averageRating);
        } catch (error) {
            console.error('Error fetching average rating:', error);
        }
    };

    const fetchTopRatedComments = async () => {
        try {
            // Fetch top-rated comments from server
            const response = await axios.get('https://bidwiser.onrender.com/api/topRatedComments');
            setTopRatedComments(response.data.topRatedComments);
        } catch (error) {
            console.error('Error fetching top-rated comments:', error);
        }
    };
    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
    <div className="feedback-container">
        <div className="feedback-form card feed-c" style={{padding:"0px",border:"none"}}>
            <h2 style={{marginBottom:"0px",border:"none"}} className='card-title ch-t'>We value your feedback</h2>
            <span style={{ border: "3px solid #333333",borderTop:"none"}}>
                <form onSubmit={handleSubmit}>
                    <span className="feedback-rating">
                        <label style={{ width: '470px',margin:"40px 0px 0px 40px" }}>How satisfied are you with this webpage?
                        <RatingStar rating={feedback.rating}  onChange={handleInputChange} />
                        </label>  
                    </span>
                    <div className="feedback-comment">
                            <label style={{margin:"20px 0px 20px 0px" }}>Why did you give this rating?</label>
                            <div className='feedback-commentl'>
                                <textarea name="comment" value={feedback.comment} onChange={handleInputChange} />
                            </div>
                    </div>
                    <br />
                    <div >
                        <button style={{margin:"0px 277px 30px"}} className='btn btn-primary1' type="submit">Submit</button>
                    </div>
                </form>
            </span>
        </div>
            {/* {averageRating && (
                <div className="average-rating">
                    <h3>Average Rating: {averageRating.toFixed(2)}</h3>
                    <button className="toggle-comments-btn" onClick={toggleComments}>
                        {showComments ? 'Hide Comments' : 'Show Comments'}
                    </button>
                </div>
            )}
            <div className="top-rated-comments" style={{ display: showComments ? 'block' : 'none' }}>
                <h2>Top Rated Comments</h2>
                <ul className="comment-list">
                    {topRatedComments.map((comment, index) => (
                        <li key={index}>{comment.comment}</li>
                    ))}
                </ul>
            </div> */}
    </div>    
    );
};

export default FeedbackForm;
