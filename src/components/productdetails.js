import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Buffer} from 'buffer';
import { useAuth } from './AuthContext';
import { Link, useNavigate, useParams,useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SuggestedPost from './SuggestedPost';
import './ProductDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'; // Importing the user-circle icon


const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const location = useLocation()
  const [productImage, setProductImage] = useState(null);
  const [imageStream,setImageStream] =useState(null)
  const auth = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams(); // Get productId from URL params

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5500/api/products/${productId}`);
        const imageResponse =  await fetch(`http://127.0.0.1:5500/api/images/${response.data.product.imageUrl}`);
        // console.log(imageResponse)
        const data = await imageResponse.json()
        // const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer.buffer)));
        const base64String = Buffer.from(data.buffer.data).toString('base64')
        const image = `data:${data.contentType};base64,${base64String}`;     
        setImageStream(image)
       

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
        try{
        const category = response.data.product.category;
        const productId= response.data.product._id;
        //console.log(category)
        const response1 = await axios.post(`http://127.0.0.1:5500/api/products/by-category`, { category ,productId});
        setSuggestedPosts(response1.data);
        }
        catch(error){
          //alert('no response');
        }
        
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    const fetchProducts = () => {
      fetchProductDetails();
    };

    fetchProductDetails();

    const intervalId = setInterval(fetchProducts, 1000);

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
        category: product.category
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
              src={imageStream}
              alt={product.name}
              className="pro-img det-img-thumbnail"
            />
          
          
          )}

          <div className='pro-info'>
            <div className='c'>
            <h2 className='hn'>{product.name}</h2>
            <div className='p-de'>
              <div className="description">{product.description}</div>
              <div className="sel">
                <Link to={`/sellerinfo/${product.userId}`}>
                  <FontAwesomeIcon icon={faUserCircle} className="us-ic" />
                  <span className='id'>&nbsp;{product.userId}</span>
                </Link>
              </div>
              <div className="bid-details cur">Current Bid:&nbsp;&#8377;<strong>{product.currentBid}</strong></div>
              <div className="bid-details">Starting Bid: &#8377;{product.startingBid}</div>
              {product.winnerEmail && <p className="winner-email">Winner Email: {product.winnerEmail}</p>}
              {product.winnerEmail && <p className="highest-bid">Highest Bid: &#8377;{product.currentBid}</p>}
              {winnerMessage && <p className="winner-message">{winnerMessage}</p>}
              {product.endTime && (
                <div className="end-time">
                  {remainingTime ? remainingTime : "Bidding for this product has ended."}
                </div>
              )}

              {/* Conditionally render buttons if there is remaining time or no winner */}
              {remainingTime || winnerMessage ? (
                <div className="button-container bc">
                  <button className="bp" onClick={handleBid}>
                    <strong>Place Bid</strong>
                  </button>
                  <button className="bp" onClick={handleChatClick(productId)}>
                  <strong>Chat</strong>
                  </button>
                </div>
              ) : null}
            </div>
            </div>
          </div>
        </div>
        
        
      ) : (
        <p>Loading...</p>
      )}
      
      {/* Suggested Post */}
      <div className='conatiner-suggestedposts' style={{paddingBottom:"40px"}}> 
        <h3 className='sug'>Similar products</h3>
        <div className="suggested-post">
       {suggestedPosts.map((post) => (
            <SuggestedPost key={post._id} post={post} />
          ))}
        </div>
      </div>
      

      {showBidModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Place Bid</h2>
                <button type="button" className="btn-close" onClick={() => setShowBidModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="number"
                  placeholder="Enter your bid amount"
                  className="form-control f-c"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <p>Current Bid: &#8377;{product.currentBid}</p>
              </div>
              <div className="modal-footer">
                <button className="btn-primary2 b-cb" onClick={placeBid}>
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