import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../components/Product.css';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Buffer } from 'buffer';

const ProductsPage = ({ darkMode, email, bidChange }) => {
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('all'); // Default to sorting by all
  const [bidAmount, setBidAmount] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userBids, setUserBids] = useState([]);
  const [modifyProductId, setModifyProductId] = useState(null);
  const [winningUsers, setWinningUsers] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [flag, setFlag] = useState(0);
  const navigate = useNavigate();

  // Use the userId from the context
  const auth = useAuth();
  const userId = auth.userId;

  // Fetch winning user details
  const fetchWinningUser = async (productId) => {
    try {
      const winningUserResponse = await axios.get(`http://127.0.0.1:5500/api/getWinningBid/${productId}`);
      setWinningUsers((prevWinningUsers) => ({
        ...prevWinningUsers,
        [productId]: winningUserResponse.data.winningBid.userId,
      }));
    } catch (error) {
      console.error('Error fetching winning user details:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5500/api/getBids');
        setProducts(response.data.bids);
        console.log('Products:', response.data.bids);

        // Call fetchWinningUser for each product
        const winningUserPromises = response.data.bids.map(async (product) => {
          await fetchWinningUser(product._id);
        });
        await Promise.all(winningUserPromises);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request aborted:', error.message);
        } else {
          console.error('Error fetching bids:', error);
        }
      }
    };
    fetchProducts();
    // Refresh products every 10 seconds
    const intervalId = setInterval(fetchProducts, 10000);
    // Clear interval on component unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, [bidChange]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to calculate remaining time
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
      message: `Bid ends on: ${endDateFormatted}, ${hours}h ${minutes}m ${seconds}s left`,
    };
  };

  // Function to delete a bid
  const deleteBid = async (productId) => {
    try {
      // Send a DELETE request to the backend to delete the bid
      const response = await axios.delete(`http://127.0.0.1:5500/api/deleteBid/${productId}`);
      if (response.status === 200) {
        // Update the UI by removing the deleted bid from the products state
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
        console.log('Bid deleted successfully');
      } else {
        console.error('Failed to delete bid');
      }
    } catch (error) {
      console.error('Error deleting bid:', error);
      alert("Deletion not possible since the product bid is already closed.");
    }
  };

  return (
    <div className={`products-page ${darkMode ? 'dark-mode' : ''}`}>
      
      <div className="container mt-5">
        {/* Sorting dropdown menu */}
        <div style={{ marginBottom: '20px' }}>
          Sort by:
          <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="all">All</option>
            <option value="live">Live Auctions</option>
            <option value="ended">Bid Ended</option>
          </select>
        </div>
        {/* Display sorted products */}
        <div className="row">
          {products.map((product) => (
            // Check if product should be displayed based on sorting option
            ((sortBy === 'all') ||
            (sortBy === 'live' && !calculateRemainingTime(product.endTime).ended) ||
            (sortBy === 'ended' && calculateRemainingTime(product.endTime).ended)) && (
              <div key={product._id} className="col-md-4 mb-4">
                <div class='container-fluid'>
                  <div class="card mx-auto col-md-3 col-10 mt-5">
                 
                  <div className='imagecontainer'>
                      {/* Modified image rendering logic */}
                      <ProductImage product={product} />
                  </div>
                      
                    <div class="card-body text-center mx-auto">
                      <div class='cvp'>
                        <h5 class="card-title font-weight-bold">{product.name}</h5>
                        <p class="card-text">Current Bid: &#8377;{product.currentBid}</p>
                        <p className="card-text">{product.endTime &&
                          (() => {
                            const remainingTime = calculateRemainingTime(product.endTime);
                            if (remainingTime.ended) {
                              const winnerUserId = winningUsers[product._id];
                              const winningBid = product.currentBid;
                              return `Bid has ended`;
                            } else {
                              return `${remainingTime.message}`;
                            }
                          })()
                        }</p>
                        <button className="btn btn-danger" onClick={() => deleteBid(product._id)}>
                          Delete Bid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      
    </div>
  );
};

// Separate component for rendering product image
const ProductImage = ({ product }) => {
  const [imageStream, setImageStream] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageResponse = await fetch(`http://127.0.0.1:5500/api/images/${product.imageUrl}`);
        const data = await imageResponse.json();
        const base64String = Buffer.from(data.buffer.data).toString('base64');
        const image = `data:${data.contentType};base64,${base64String}`;
        setImageStream(image);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [product.imageUrl]);

  return (
    <img
      src={imageStream}
      alt={product.name}
      className="mx-auto img-thumbnail"
    />
  );
};

export default ProductsPage;
