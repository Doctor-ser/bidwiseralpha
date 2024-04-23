import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductDetails.css';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [productImage, setProductImage] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams(); // Get productId from URL params

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/products/${productId}`);
        setProduct(response.data.product);
        setProductImage(response.data.product.imageUrl);
        if (response.data.product.endTime) {
          const { ended, message } = calculateRemainingTime(response.data.product.endTime);
          setRemainingTime(ended ? message : `Bid ends in: ${message}`);

          if (ended) {
            try {
              const winnerResponse = await axios.get(`http://127.0.0.1:5500/api/products/${productId}/winner`);
              const winner = winnerResponse.data.winner;

              setProduct(prevProduct => ({
                ...prevProduct,
                currentBid: winner.bidAmount,
                winnerEmail: winner.email
              }));

            } catch (error) {
              console.error('Error fetching winner:', error);
              setWinnerMessage('No winner found for this product.');
            }

            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    const fetchProducts = () => {
      fetchProductDetails();
    };

    fetchProductDetails();

    const intervalId = setInterval(fetchProducts, 5000);

    return () => clearInterval(intervalId);
  }, [productId]);

  const handleBid = async () => {
    if (!auth.loggedIn) {
      alert('Please log in to place a bid.');
      navigate('/login');
      return;
    }
    if (!product || (product.endTime && new Date(product.endTime) < new Date())) {
      alert('Bidding for this product has already ended.');
      return;
    }
    const nextBidAmount = product.currentBid + 10;
    setBidAmount(nextBidAmount);
    setShowBidModal(true);
  };

  const handleChatClick = (productId) => {
    return () => {
      if (!product || (product.endTime && new Date(product.endTime) < new Date())) {
        alert('Bidding for this product has already ended.');
        return;
      }

      if (!auth.loggedIn) {
        alert('Please log in to start a chat.');
        navigate('/login');
        return;
      }

      navigate(`/chat/${productId}`);
    };
  };

  const placeBid = async () => {
    if (!auth.loggedIn) {
      alert('Please log in to place a bid.');
      navigate('/login');
      return;
    }

    try {
      const userId = auth.userId;

      if (userId === product.userId) {
        alert(`You are the seller of ${product.name}. You cannot place a bid for your products.`);
        return;
      }

      if (!userId || !productId || bidAmount <= 0) {
        alert('Invalid bid details.');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5500/api/placeBid', {
        productId,
        userId,
        bidAmount: Number(bidAmount),
      });

      if (response.status === 200) {
        alert('Bid placed successfully');
        setShowBidModal(false);
        setBidAmount(0);
      } else {
        alert('Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('You are currently the highest bidder');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateRemainingTime = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeDiff = end - now;

    if (timeDiff <= 0) {
      return {
        ended: true,
        message: 'Bid has ended',
      };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const endDateFormatted = formatDate(endTime);

    return {
      ended: false,
      message: `${endDateFormatted}, ${hours}h ${minutes}m ${seconds}s left`,
    };
  };

  return (
    <div className='full'>
      {product ? (
        <div className='pro-details'>
          {productImage && (
            <img
              src={`http://127.0.0.1:5500/api/images/${productImage}`}
              alt={product.name}
              className="pro-img det-img-thumbnail"
            />
          )}

          <div className='pro-info'>
            <h2>{product.name}</h2>
            <p className="description">{product.description}</p>
            <Link to={`/sellerinfo/${product.userId}`} className="card-text">Seller Info</Link>
            <p className="bid-details">Starting Bid: &#8377;{product.startingBid}</p>
            <p className="bid-details">Current Bid: &#8377;{product.currentBid}</p>
            <p className="added-by">Product Added By: {product.userId}</p>
            {product.winnerEmail && <p className="winner-email">Winner Email: {product.winnerEmail}</p>}
            {product.winnerEmail && <p className="highest-bid">Highest Bid: &#8377;{product.currentBid}</p>}
            {winnerMessage && <p className="winner-message">{winnerMessage}</p>}
            {product.endTime && (
              <p className="end-time">
                {remainingTime ? remainingTime : "Bidding for this product has ended."}
              </p>
            )}

            {/* Conditionally render buttons if there is remaining time or no winner */}
            {remainingTime || winnerMessage ? (
              <div className="button-container">
                <button className="btn-p cart px-auto" onClick={handleBid}>
                  Place Bid
                </button>
                <button className="chat-btn" onClick={handleChatClick(productId)}>
                  Chat
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {showBidModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Place Bid</h2>
                <button type="button" className="btn-close" onClick={() => setShowBidModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Current Bid: &#8377;{product.currentBid}</p>
                <input
                  type="number"
                  placeholder="Enter your bid amount"
                  className="form-control"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn-primary2" onClick={placeBid}>
                  Confirm Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
