import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './sellerinfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import RatingReview from './star.jsx';
import { Buffer } from 'buffer';
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
        <ul>
          {productData.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </ul>
      </div>
        <div class="feedback-form card feed-c" style={{padding:"0px",border:"none", display:"flex",marginLeft:"450px"}}>
         <h2 class="card-title ch-t" style={{marginBottom: "0px", border: "none"}}>Top reviews for this Seller</h2>
          <p>
            {topFeedbacks.map((feedback, index) => (
              <p key={index}><h3 style={{textAlign:"center",marginTop:"30px",fontWeight:"bold",padding:"25px",backgroundColor:"#ededed"}}>Review {index+1}&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;<strong>{feedback.feedback}</strong></h3></p>
            ))}
          </p>
        </div>
    </div>
  );
};

// Separate component for rendering product card
const ProductCard = ({ product }) => {
  const [imageStream, setImageStream] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageResponse = await fetch(`http://127.0.0.1:5500/api/images/${product.imageUrls}`);
        const data = await imageResponse.json();
        const base64String = Buffer.from(data.buffer.data).toString('base64');
        const image = `data:${data.contentType};base64,${base64String}`;
        setImageStream(image);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [product.imageUrls]);

  return (
    <div className='card1 card ccx'>
      <img 
        src={imageStream}
        alt={product.name}
        className="img-thumbnail ig-mar"
      />
      <div className="product-details">
        <p style={{margin:"30px 40px",color:"#333333"}}>
          <h4 style={{marginTop:"15px", fontWeight:"bold"}}>Product Name &nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;<strong>{product.productName}</strong> </h4><br />
          <h4 style={{ fontWeight:"bold"}}>User Review &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>{product.feedback.join(', ')}</strong></h4>
        </p>
      </div>
      <div className="rating-column">
        <div className="star" style={{margin:"45px 40px", paddingTop:"10px"}}>
          <span className='stxt'style={{color:"Black"}}>Product Rating :</span>
          <RatingReview rating={product.ratings} />
        </div>
      </div>
    </div>
  );
};

export default SellerInfoPage;
