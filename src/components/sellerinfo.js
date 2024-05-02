import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './sellerinfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import RatingReview from './star.jsx';



const SellerInfoPage = () => {
  const { userId } = useParams();
  const [averageRating, setAverageRating] = useState(0);
  const [topFeedbacks, setTopFeedbacks] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [ratingsResponse, productsResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:5500/api/userratings/${userId}`),
          axios.get(`http://127.0.0.1:5500/api/getProductFeedback/${userId}`)
        ]);

        setAverageRating(ratingsResponse.data.averageRating);
        setTopFeedbacks(ratingsResponse.data.feedbacks);
        setProductData(productsResponse.data.productData);
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    };

    fetchSellerData();
  }, [userId]);

  return (
    <div>
      <div className='name-bar'>
        <FontAwesomeIcon icon={faUserCircle} className="u-ic" /> 
        <span className='nb-txt'>{userId}</span>
        <div className="star">
          <span className='stxt'> Seller Rating :</span>
          <RatingReview rating={averageRating} />
        </div>
      </div>
      <div className='f-det'>
        <div className='f-ig'>
          <img src='https://wallpapercave.com/wp/wp9277691.jpg' alt='car-img' style={{ height: '200px', width: '300px' }}></img>
        </div>
        <ul>
          {productData.map((product, index) => (
            <div className='card1'>
            <li key={index}>
              <div>Product name:<strong>{product.productName}</strong></div>
              <div>
                <span>Feedback: {product.feedback.join(', ')}</span>
              </div>
              <div>
                <span>Ratings: {product.ratings.join(', ')}</span>
              </div>
               {/* <div>
                <span>imageUrl: {product.imageUrls}</span>
              </div> 
               */}
              <img
                      src={`http://127.0.0.1:5500/api/images/${product.imageUrls}`}
                      alt={product.name}
                      className="mx-auto img-thumbnail"/>
            </li>
            </div>
            
          ))}
        </ul>
      </div>
      <h3>Top reviews for this seller:</h3>
      <ul>
        {topFeedbacks.map((feedback, index) => (
          <li key={index}>{feedback.feedback}</li>
        ))}
      </ul>
    </div>
  );
};

export default SellerInfoPage;
