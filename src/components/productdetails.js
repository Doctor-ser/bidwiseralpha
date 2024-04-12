import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link,useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams(); // Get productId from URL params



  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/products/${productId}`);
        setProduct(response.data.product);
  
        if (response.data.product.endTime) {
          const { ended, message } = calculateRemainingTime(response.data.product.endTime);
          setRemainingTime(ended ? message : `Bid ends in: ${message}`);
  
          // Check if the bid has ended
          if (ended) {
            try {
              // Fetch winner of the product
              const winnerResponse = await axios.get(`http://127.0.0.1:5500/api/products/${productId}/winner`);
              const winner = winnerResponse.data.winner;
  
              setProduct(prevProduct => ({
                ...prevProduct,
                currentBid: winner.bidAmount, // Update current bid with the winning bid amount
                winnerEmail: winner.email // Update winner email with the email of the winning user
              }));
  
            } catch (error) {
              console.error('Error fetching winner:', error);
              setWinnerMessage('No winner found for this product.');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
  
    const fetchProducts = () => {
      fetchProductDetails();
    };
  
    // Fetch product details initially
    fetchProductDetails();
  
    // Refresh products every 5 seconds
    const intervalId = setInterval(fetchProducts, 5000);
  
    // Clear interval on component unmount to prevent memory leaks
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

    setShowBidModal(true);
  };

  const handleChatClick = (productId) => {
    return () => {
      // Find the product associated with the productId
    //   const product = products.find((p) => p._id === productId);
  
      // Check if the product exists and if the bidding has ended
      if (!product || (product.endTime && new Date(product.endTime) < new Date())) {
        alert('Bidding for this product has already ended.');
        return;
      }
  
      // Check if the user is logged in
      if (!auth.loggedIn) {
        alert('Please log in to start a chat.');
        // Optionally, you can redirect to the login page
        navigate('/login');
        return;
      }
  
      // If the user is logged in and the bidding is active, navigate to the chat page
      navigate(`/chat/${productId}`);
    };
  };


  const placeBid = async () => {
    if (!auth.loggedIn) {
      alert('Please log in to place a bid.');
      navigate('/login');
      return;
    }

    // Your bid placement logic goes here
    // This function will be called when the user confirms the bid
    // Example: send bid amount to backend, update product details, etc.

    try {
      const userId = auth.userId; // Assuming you have a way to get the user ID
    //   const productId = product._id; // Assuming you have a way to get the product ID

      // Perform validation if needed
      if (!userId || !productId || bidAmount <= 0) {
        alert('Invalid bid details.');
        return;
      }

        // Use userId consistently
        if(userId===product.userId){
          alert(`You are the seller of ${product.name} you cannot place bid for your products`);
          return; 
        }

      // Example: Send bid amount to backend
      const response = await axios.post('http://127.0.0.1:5500/api/placeBid', {
        productId,
        userId,
        bidAmount: Number(bidAmount),
      });

      if (response.status === 200) {
        // Update product details after placing bid
        // Fetch updated product details from backend and update state if necessary
        // Example: setProduct(updatedProductData);
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

  // Function to format date in "dd/mm/yyyy" format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
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
    <div>
      {product ? (
        <div>
          <h2>{product.name}</h2>
          <p>Description: {product.description}</p>
          <Link to={`/sellerinfo/${product.userId}`} className="card-text">Seller Info</Link>
          <p>Starting Bid: &#8377;{product.startingBid}</p>
          <p>Current Bid: &#8377;{product.currentBid}</p>
          <p>Product Added By: {product.userId}</p>
          {product.winnerEmail && <p>Winner Email: {product.winnerEmail}</p>}
          {product.winnerEmail && <p>Highest Bid: &#8377;{product.currentBid}</p>}
          {winnerMessage && <p>{winnerMessage}</p>}
          {product.endTime && (
            <p>
              {remainingTime ? remainingTime : "Bidding for this product has ended."}
            </p>
          )}
          
          {/* Conditionally render buttons if there is remaining time or no winner */}
          {remainingTime || winnerMessage ? (
            <div>
              <button className="btn-p cart px-auto" onClick={handleBid}>
                Place Bid
              </button>
              <button className="chat-btn" onClick={handleChatClick(productId)}>
                Chat
              </button>
            </div>
          ) : null}
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
