import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate,Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import EndedBid from './EndedBid';
import { ActiveBid } from './ActiveBid';
import {Buffer} from 'buffer'

const ProductsPage = ({ darkMode, email,bidChange }) => {
  const [products, setProducts] = useState([]);
  const [bidAmount, setBidAmount] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userBids, setUserBids] = useState([]); // New state to store user's bids
  const [modifyProductId, setModifyProductId] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [flag,setflag]=useState(0);
  const navigate = useNavigate();
  const [activeProducts, setActiveProducts] = useState([]);
  const [topDeal, setTopDeal] = useState(null);
  const [reloadPage, setReloadPage] = useState(false);
  const [imageStream,setImageStream] =useState(null)
  

  
  
  // Use the userId from the context
  const auth = useAuth();
  const userId = auth.userId 
  const location = useLocation();

    // Fetch winning user details
    // const fetchWinningUser = async (productId) => {
    //   try {
    //     const winningUserResponse = await axios.get(`http://127.0.0.1:5500/api/getWinningBid/${productId}`);
    //     setWinningUsers((prevWinningUsers) => ({
    //       ...prevWinningUsers,
    //       [productId]: winningUserResponse.data.winningBid.userId,
    //     }));
    //   } catch (error) {
    //     console.error('Error fetching winning user details:', error);
    //   }
    // };


const calculateRemainingTimeForCounter = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const timeDiff = end - now;

  if (timeDiff <= 0) {
    return {
      ended: true,
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return {
    ended: false,
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  };
};
useEffect(() => {
  // Function to reload the page only once
  const reloadPageOnce = () => {
    // Check if the page has already been reloaded
    
      console.log("Reloaded");
      window.location.reload();
    
  };

  // If the reloadPage flag is true, reload the page
  if (reloadPage) {
    reloadPageOnce();
    console.log("fun called");
    setReloadPage(false);
  }
}, [reloadPage]);

useEffect(() => {
  // Check if the route changed and if the current location is this page
  if (location.pathname === '/products') {
    console.log("Reloadset");
    setReloadPage(true);
  }
}, [location.pathname]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5500/api/getBids');
      setProducts(response.data.bids);
      console.log('Products:', response.data.bids);

      // Call fetchWinningUser for each product
      // const winningUserPromises = response.data.bids.map(async (product) => {
      //   await fetchWinningUser(product._id);
      // });
      // await Promise.all(winningUserPromises);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request aborted:', error.message);
      } else {
        console.error('Error fetching bids:', error);
      }
    }
  };
  fetchProducts();
  // Refresh products every 5 seconds
   
  const intervalId = setInterval(fetchProducts, 500000);
  // Clear interval on component unmount to prevent memory leaks
  return () => clearInterval(intervalId);
  
}, [bidChange]);

// const renderWinningUser = (productId) => {
//   const winnerUserId = winningUsers[productId];
//   return winnerUserId ? `Won By: ${winnerUserId}` : 'No Winner';
// };
// Trigger recalculation when products change // Fetch user bids whenever userId changes  // The empty dependency array ensures that this effect runs only once when the component mounts

  // useEffect(() => {
  
  //   // Call fetchWinningUser when selectedProduct changes
  //   if (selectedProduct) {
  //     fetchWinningUser(selectedProduct.productId);
  //   }
  // }, [selectedProduct]);

  // Function to format date in "dd//mm/yyyy" format
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
      message: `Bid ends on: ${endDateFormatted}, ${hours}h ${minutes}m ${seconds}s left`,
    };
  };


  //mail to winner of each product
  const sendEmailToWinner = async (productName, winningBid, productId) => {
    try {
        const response = await axios.post('http://127.0.0.1:5500/api/sendEmailToWinner', {
            productName,
            winningBid,
            productId
        });
        console.log('Email sent to winner:', response.data.message);
    } catch (error) {
        console.error('Error sending email to winner:', error);
    }
};


  const handleBid = async (productId, currentBid,startingBid,category) => {
    // Check if the user is logged in
    if (!auth.loggedIn) {
      alert('Please log in to place a bid.');
      // Optionally, you can redirect to the login page
      navigate('/login'); // Redirect to login page
      return;
    }

    // Fetch the product
  const product = products.find((p) => p._id === productId);

  if (!product) {
    alert('Product not found in the list');
    return;
  }

     // Check if bidding has ended
  if (product.endTime && new Date(product.endTime) < new Date()) {
    alert('Bidding for this product has already ended.');
    return;
  }
    setShowBidModal(true);
    setSelectedProduct({ productId, currentBid,startingBid ,category});

   
  };

  const placeBid = async () => {
    if (!auth.loggedIn) {
      alert('Please log in to place a bid.');
      // Optionally, you can redirect to the login page
      navigate('/login');
      return;
    }
    
  
    console.log('Selected Product:', selectedProduct);
    console.log('Bid Amount:', bidAmount);
  
    if (!selectedProduct) {
      alert('Invalid product');
      return;
    }
  
    const product = products.find((p) => p._id === selectedProduct.productId);
  
    if (!product) {
      alert('Product not found in the list');
      return;
    }
  
    const startingBid = Number(product.startingBid);
  
    if (Number(bidAmount) <= startingBid) {
      alert(`Bid amount must be greater than the starting bid of ${startingBid}`);
      return;
    }
  
    try {
      const userId = auth.userId;
      // Use userId consistently
      if(userId===product.userId){
        alert(`You are the seller of ${product.name} you cannot place bid for your products`);
        return; 
      }
      
      if (Number(bidAmount) <= product.currentBid) {
        alert(`Bid amount must be greater than the current bid of ${product.currentBid}`);
        return;
      }

      if (!userId) {
        alert('User ID not found.');
        return;
      }
      //window.location.href="/product";

      const response = await axios.post('http://127.0.0.1:5500/api/placeBid', {
        productId: selectedProduct.productId,
        userId:userId,// Use userId consistently
        bidAmount: Number(bidAmount),
        category:selectedProduct.category
      });

      
      console.log('Place Bid Response:', response);
      

  
      if (response.status === 200) {
        // Fetch winning user details after placing a bid
        // await fetchWinningUser(selectedProduct.productId);
  
        // Update the bid amount for the product in the state
        const updatedProducts = products.map((p) =>
          p._id === selectedProduct.productId ? { ...p, currentBid: Number(bidAmount) } : p
        );
        setProducts(updatedProducts); // Update product state with new bid amount
  
        // Fetch user bids after placing a bid
        const updatedUserBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getUserBids/${userId}`);
        setUserBids(updatedUserBidsResponse.data.userBids);
  
        // Clear the bid modal
        setShowBidModal(false);
        setBidAmount('');
        setflag((prevFlag) => prevFlag + 1);
      } 
      else if(response.data.message === 'You are already the winning bidder'){
      alert(response.data.message);
      }
      else {
        alert('Failed to place bid', response.data);
      }  } 
  
  
  catch (error) {
    console.error('Error placing bid:', error);
    alert('You are currently the highest bidder');
  }
};
  
  const handleConfirmModifyBid = async (productId, newBid) => {
    try {
      const res = await axios.put(`http://127.0.0.1:5500/api/modifyBid/${productId}`, {
        newBid,
      });
  
      if (res.status === 200) {
        alert('Bid modified successfully');
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? { ...product, startingBid: parseInt(newBid) } : product
          )
        );
        setModifyProductId(null);
  
        // Fetch user bids after modifying a bid
        const updatedUserBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getUserBids/${userId}`);
        setUserBids(updatedUserBidsResponse.data.userBids);
      } else {
        console.error('Failed to modify bid');
      }
    } catch (error) {
      console.error('Error modifying bid:', error);
      alert('An error occurred while modifying bid');
    }
  };
  
  
  
  const closeModal = () => {
    setShowBidModal(false);
    setSelectedProduct(null);
    setBidAmount('');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Filter products based on search criteria
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.startingBid.toString().includes(searchTerm) || // 
        product.currentBid.toString().includes(searchTerm)  ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

   



  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };



  // Function to save bids data to local storage
  const saveBidsToLocalStorage = (bids) => {
    localStorage.setItem('bids', JSON.stringify(bids));
  };

  // Function to get bids data from local storage
  const getBidsFromLocalStorage = () => {
    const bids = localStorage.getItem('bids');
    return bids ? JSON.parse(bids) : [];
  };

  //sort expired
  const activeBidProducts = filteredProducts.filter((product) => !product.endTime || new Date(product.endTime) > new Date());
  const endedBidProducts = filteredProducts.filter((product) => product.endTime && new Date(product.endTime) <= new Date());

  // Sort active bid products based on remaining time
  activeBidProducts.sort((a, b) => {
    const remainingTimeA = calculateRemainingTime(a.endTime);
    const remainingTimeB = calculateRemainingTime(b.endTime);
    return remainingTimeA - remainingTimeB;
  });
  
  //top deal
  useEffect(() => {
    const fetchActiveProductsAndTopDeal = async () => {
      try {
        console.log("entry")
        const activeProductsResponse = await axios.get('http://127.0.0.1:5500/api/active-products');
        const activeProducts = activeProductsResponse.data.activeProducts;
        
        setActiveProducts(activeProducts);
  
        // Check if there are multiple active products
        if (activeProducts.length > 1) {
          console.log("if block")
          const topDealResponse = await axios.get('http://127.0.0.1:5500/api/top-deal');
         // console.log(topDealResponse.data.topDeal.imageUrl)
          
        
        
        const imageResponse =  await fetch(`http://127.0.0.1:5500/api/images/${topDealResponse.data.topDeal.imageUrl}`);
        // console.log(imageResponse)
        const data = await imageResponse.json()
        
        const base64String = Buffer.from(data.buffer.data).toString('base64')
        const image = `data:${data.contentType};base64,${base64String}`;     
        setImageStream(image)
       
          const topDeal = topDealResponse.data.topDeal;
          console.log('Top Deal:', topDeal);
          setTopDeal(topDeal);
          console.log("topdealsetupped")
        }
        else if (activeProducts.length === 1) {
          const singleActiveProduct = activeProducts[0];
          setTopDeal(singleActiveProduct);
          console.log('Top Deal:', singleActiveProduct.imageUrl);
        }
         else {
          setTopDeal(null); // No top deal if there's only one active product
        }
      } catch (error) {
        console.error('Error fetching active products and top deal:', error);
      }
    }; 
    fetchActiveProductsAndTopDeal();
  }, []);

  return (
    <div className={`products-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container mt-5">
        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search by Product Name or Bid or Category: "
            className="form-control"
            value={searchTerm}
            onChange={handleSearch}
          />
          <select className="form-select drop" value={searchTerm} onChange={handleSearch}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion and Clothing">Fashion and Clothing</option>
            <option value="Home and Garden">Home and Garden</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Automotive">Automotive</option>
            <option value="Art and Crafts">Art and Crafts</option>
            <option value="Sports and Fitness">Sports and Fitness</option>
            <option value="Books and Media">Books and Media</option>
            <option value="Toys and Games">Toys and Games</option>
            <option value="Health and Beauty">Health and Beauty</option>
            <option value="Other">Other</option>
          {/* Add more options as needed */}
        </select>
          {/* <button  className="btn btn-primary1 ms-2">Search</button> */}
        </div>


        {/* cart banner section */}
        {/* {console.log(topDeal)} */}
        {topDeal && (
  <section className="cart-banner pt-100 pb-100">
    <div className="container">
      <div className="row clearfix">
        {/* Image Column */}
        <div className="image-column col-lg-6">
          <div className="image">
            <div className="price-box">
              <div className="inner-price">
                <span className="price">
                  <strong>Top Deal!</strong> <br/> {/* You can customize the label */}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              {imageStream ? (
                <img src={imageStream} alt="Banner" height="400" width="600" />        
              ) : (
                <div>No image available</div>
              )}
            </div>
          </div>
        </div>
        {/* Content Column */}
        <div className="content-column col-lg-6">
          <h3><span className="orange-text">Deal</span> of the Day</h3>
          <h4>{topDeal.name}</h4>
          <div className="text">{topDeal.description}</div>
          
          {/* counter */}
{topDeal.endTime && (() => {
    const remainingTimec = calculateRemainingTimeForCounter(topDeal.endTime);
    return (
        <div className="time-counter">
            <div className="time-countdown clearfix" data-countdown="" id="countdown">
                <div className="counter-column">
                    <div className="inner">
                        <span className="count" id="days">{remainingTimec.days}</span>Days
                    </div>
                </div>
                <div className="counter-column">
                    <div className="inner">
                        <span className="count" id="hours">{remainingTimec.hours}</span>Hours
                    </div>
                </div>  
                <div className="counter-column">
                    <div className="inner">
                        <span className="count" id="minutes">{remainingTimec.minutes}</span>Mins
                    </div>
                </div>  
                <div className="counter-column">
                    <div className="inner">
                        <span className="count" id="seconds">{remainingTimec.seconds}</span>Secs
                    </div>
                </div>
            </div>
        </div>
    );
})()}


          <Link to={`/products/${topDeal._id}`} className="cart-btn mt-3">
        <i className="fas fa-shopping-cart"></i> View Details
      </Link>
        </div>
      </div>
    </div>
  </section>
)}
          {/* end cart banner section */}

        <div className='cap-head'>
        <span className="text">Live Auctions</span>
        </div>
        <div className="row">
          {/* Display filtered products instead of all products */}
          {activeBidProducts.map((product) => (
              <ActiveBid key={product._id} product={product} calculateRemainingTime={calculateRemainingTime} sendEmailToWinner={sendEmailToWinner} handleBid={handleBid} />
          ))}
        </div>


        <div className='cap-head'>
        <span className="text">End Auctions</span>
        </div>

        {/* bidended */}
        <div className="row">
          {/* Display filtered products instead of all products */}
          {endedBidProducts.map((product) => (
              <EndedBid key={product._id} product={product} calculateRemainingTime={calculateRemainingTime} sendEmailToWinner={sendEmailToWinner} handleBid={handleBid} />
           
          ))}
        </div>


      </div>

      {showBidModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Place Bid</h2>
                <button type="button" className="btn-close" onClick={closeModal}>
                </button>
              </div>
              <div className="modal-body">
                <p>Current Bid: &#8377;{selectedProduct.currentBid}</p>
              
                <p style={{display:"none"}}>{ bidAmount==0 && flag==0 ?(setBidAmount(selectedProduct.currentBid+10),showBidModal&&setflag(1)):showBidModal&&bidAmount}</p>
                 <input type="number"
                  placeholder="Enter your bid amount"
                  className="form-control1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn-primary2" onClick={placeBid}>
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 

export default ProductsPage; 

