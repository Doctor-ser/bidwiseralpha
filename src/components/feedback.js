import React, { useState, useEffect } from 'react';
import './feedback.css';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import { useNavigate } from 'react-router-dom';

const FeedbackForm = ({ darkMode }) => {
    const auth = useAuth();
    const { userId, loggedIn } = useAuth(); // Get userId and loggedIn status from useAuth hook
    const navigate = useNavigate(); // Import useNavigate hook for navigation

    const [feedback, setFeedback] = useState({ rating: '', comment: '' });
    const [averageRating, setAverageRating] = useState(null);
    const [topRatedComments, setTopRatedComments] = useState([]);

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

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!auth.loggedIn) {
          alert('Please log in to submit feedback.');
          navigate('/login'); // Redirect to login page
          return;
      }
      try {
          // Use userId obtained from useAuth
          await axios.post('http://127.0.0.1:5500/api/feedback', { ...feedback, userId });
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
            const response = await axios.get('http://127.0.0.1:5500/api/feedback/average');
            setAverageRating(response.data.averageRating);
        } catch (error) {
            console.error('Error fetching average rating:', error);
        }
    };

    const fetchTopRatedComments = async () => {
        try {
            // Fetch top-rated comments from server
            const response = await axios.get('http://127.0.0.1:5500/api/topRatedComments');
            setTopRatedComments(response.data.topRatedComments);
        } catch (error) {
            console.error('Error fetching top-rated comments:', error);
        }
    };

    return (
        <div className="feedback-container">
            <div className="feedback-form">
                <h2>Submit Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <div className="feedback-rating">
                        <label>
                            Rating:
                            <div className='feedback-commentl'>
                                <input type="number" name="rating" value={feedback.rating} onChange={handleInputChange} placeholder="0-5" />
                            </div>
                        </label>
                    </div>
                    <br />
                    <div className="feedback-comment">
                        <label>
                            Comment:
                            <div className='feedback-commentl'>
                                <textarea name="comment" value={feedback.comment} onChange={handleInputChange} />
                            </div>
                        </label>
                    </div>
                    <br />
                    <div className='submit-btn'>
                        <button type="submit">Submit</button>
                    </div>
                </form>
                {averageRating && (
                    <div className="average-rating">
                        <h3>Average Rating: {averageRating.toFixed(2)}</h3>
                    </div>
                )}
            </div>
            <div className="top-rated-comments">
    <h2>Top Rated Comments</h2>
    <ul>
        {topRatedComments.map((comment, index) => (
            <li key={index}>{comment.comment}</li>
        ))}
    </ul>
</div>

        </div>
    );
};

export default FeedbackForm;