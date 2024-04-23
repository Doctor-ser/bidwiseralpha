import React, { useState, useEffect } from 'react';
import '../App.css';
import './feedbackc.css';

function FettchFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState('recent');

  useEffect(() => {
    fetchFeedbacks();
    const interval = setInterval(fetchFeedbacks, 10000); // Fetch feedbacks every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5500/api/feedbacks');
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const renderFeedbacks = () => {
    let filteredFeedbacks = [...feedbacks];

    if (filter === 'recent') {
      filteredFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === 'worst') {
      filteredFeedbacks.sort((a, b) => a.rating - b.rating);
    }

    return filteredFeedbacks.map(feedback => (
      <div key={feedback._id} className="feedback">
        <div className='feedbackbox'>
        <p><strong>Rating:</strong> {feedback.rating}</p>
        <p><strong>Comment:</strong> {feedback.comment}</p>
        <p><strong>User:</strong> {feedback.userId}</p> 
        </div>
        
      </div>
    ));
  };

  return (
    <div className="feedbackform">
        
      <h1 style={{fontFamily:'Copperplate'}}>Feedbacks</h1>
      <div>
        <label htmlFor="filter">Filter by:</label>
        <select id="filter" onChange={(e) => setFilter(e.target.value)}>
          <option value="recent">Top Recent</option>
          <option value="worst">Worst Rating</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="feedbacks">
        {renderFeedbacks()}
      </div>
      
    </div>
  );
}

export default FettchFeedback;
