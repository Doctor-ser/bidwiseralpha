import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import { Link } from 'react-router-dom';
import './ProductDetails.css';

const SuggestedPost = ({ post }) => {
  const [imageStream, setImageStream] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5500'}/api/images/${post.imageUrl}`);
        const data = await imageResponse.json();
        const base64String = Buffer.from(data.buffer.data).toString('base64');
        const image = `data:${data.contentType};base64,${base64String}`;
        setImageStream(image);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [post.imageUrl]);

  return (
    <a href={`/products/${post._id}`} className='box-suggestedposts no-underline'>
              <p className='ic imagecontainer'>
        <img
          src={imageStream}
          alt={post.name}
          className="it"
        />
       </p>
              <p className="post-details">
                <p><strong>{post.name}</strong></p>
                <p>Current Bid:  <strong>&#8377;{post.currentBid}</strong></p>
              </p>
            </a>
  );
};

export default SuggestedPost; // Exporting SuggestedPost as default
