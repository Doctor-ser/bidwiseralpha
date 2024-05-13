import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './Bidding.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { border, borderRadius, padding } from '@mui/system';


const BiddingPage = ({ darkMode }) => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    startingBid: '',
    currentBid: '',
    endTime: ''
  });
  
  const { loggedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState(localStorage.getItem('bidAmount') || '');
  const [modifyProductId, setModifyProductId] = useState(null);
  const [currentBid, setCurrentBid] = useState(localStorage.getItem('currentBid') || '');
  const [file, setFile] = useState(null);
 

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5500/api/getBids?userId=${userId}`);
      setProducts(response.data.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  function generateRandomString() {
    return Math.random().toString(36).substring(7);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    
    // Check if a file is selected
    if (selectedFile) {
      // Create a URL for the selected file
      const imageUrl = URL.createObjectURL(selectedFile);
    
      // Update the newProduct state with the uploaded image file and imageUrl
      setNewProduct({
        ...newProduct,
        imageFile: selectedFile,
        imageUrl: imageUrl
      });
    } else {
      // If no file is selected, clear the image URL and file
      setNewProduct({
        ...newProduct,
        imageFile: null,
        imageUrl: ''
      });
    }
  };
  
  const handleImageProduct = async (imageUrl) => {
    console.log('image', file);
    if (!file) {
      alert('Please upload an image first.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageUrl', imageUrl);
  
      const response = await axios.post('http://127.0.0.1:5500/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200) {
      } else {
        alert('Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('An error occurred while uploading image');
    }
  };
  
  const handleAddProduct = async () => {
    if (loggedIn) {
      const { startingBid, name, category, description, endTime, imageFile } = newProduct;
      
      if(imageFile){console.log("imagefile");}
      else{
        console.log("no imagefile");
      }
      // Validate that all required fields are filled
      if (!name || !description || !startingBid || !endTime || !imageFile || !category) {
        alert('Please fill all the required bid details first.');
        return;
      }
  
      // Convert startingBid to a number
      const numericStartingBid = parseInt(startingBid);
  
      try {
        const imageUrl = generateRandomString();
        await handleImageProduct(imageUrl);
        const response = await axios.post('http://127.0.0.1:5500/api/addBid', {
          ...newProduct,
          userId,
          currentBid: numericStartingBid, // Pass startingBid as the current bid
          imageUrl: imageUrl,
        });
        if (response.data === 'End time should be in the future') {
          alert('End time should be in the future');
        } else if (response.status === 200) {
          alert('Bid added successfully');
          const updatedProducts = [...products, { ...response.data.bid }];
          setProducts(updatedProducts);
          localStorage.setItem('products', JSON.stringify(updatedProducts)); // Store in localStorage
          
        }
      } catch (err) {
        console.error('Error adding bid:', err);
        alert('An error occurred while adding bid');
      }
    } else {
      alert('Please login first');
      navigate('/login');
    }
  };
  

  const handleDeleteProduct = async (productId) => {
    if (loggedIn) {
        try {
            const response = await axios.delete(`http://127.0.0.1:5500/api/deleteBid/${productId}`);
            console.log('Response from server:', response);
            if (response.status === 200) {
                alert('Bid deleted successfully');
                setProducts((prevProducts) =>
                    prevProducts.filter((product) => product._id !== productId)
                );
            } else if (response.status === 400) {
                alert(response.data.message);
            } else {
                alert('Failed to delete bid');
            }
        } catch (error) {
            console.error('Error deleting bid:', error);
            alert('Product bid time expired. Deletion not possible.');
        }
    } else {
        alert('Please login first');
        navigate('/login');
    }
};

  const handleModifyBid = (productId, newBid) => {
    setModifyProductId(productId);
  };

  const handleConfirmModifyBid = (productId, newBid) => {
    axios
      .put(`http://127.0.0.1:5500/api/modifyBid/${productId}`, {
        newBid,
        currentBid: bidAmount,
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.message === 'Bidding for this product has already ended. Modification not allowed.') {
            alert(res.data.message);
            return;
          }
          alert('Bid modified successfully');
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product._id === productId
                ? { ...product, startingBid: parseInt(newBid), currentBid: parseInt(bidAmount) }
                : product
            )
          );
          setModifyProductId(null);
        } else {
          Promise.reject();
        }
      })
      .catch((err) => {
        if (err.response) {
          const errorMessage = err.response.data.message || 'An error occurred while modifying bid';
          alert(errorMessage);
        } else {
          alert('An error occurred while modifying bid');
        }
      });
  };

  const handleRemoveImage = () => {
    setFile(null); // Clear the selected file
    setNewProduct({
      ...newProduct,
      imageFile: null, // Remove the image file from the newProduct state
      imageUrl: '' // Clear the imageUrl
    });
  };
  
  return (
    <div className={`bidding-page ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className='t1'>Add New Product</h2>
      <h3 className='t2 cap-head'>Product Details</h3>
      <div className='details'>
      <div class="info">
          <div>
            <label>Title</label>
            <input type="text" name="name" placeholder='Enter Name of product' value={newProduct.name || ''} onChange={handleInputChange} />
          </div>
          <div>
          <label >Category</label>
          <select style={{width:"465px",height:"50px",border:"1px solid #d2d2d2",color:"#837d77",padding:"10px",borderRadius:"5px"}} name="category" value={newProduct.category || ''} onChange={handleInputChange}>
            <option value="">Select a category</option>
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
          </select>
          </div>

          
          <div>
            <label >Description</label>
            <input className='desc' placeholder='Enter Description' type="text" name="description" value={newProduct.description || ''} onChange={handleInputChange} />
          </div>
          <div>
            <label>Starting Bid</label>
            <input type="number"  style={{border:"1px solid #d2d2d2",color:"#837d77"}} placeholder='Enter Start price' name="startingBid" value={newProduct.startingBid || ''} onChange={handleInputChange} />
          </div>

          <div>
            <label>End Time</label>
            <input  style={{border:"1px solid #d2d2d2",color:"#837d77"}} type="datetime-local" name="endTime" value={newProduct.endTime || ''} onChange={handleInputChange} />
          </div>
        </div>
        <div className='img'>
        <div className="file-upload" onClick={handleRemoveImage}>
          <label>Add Image</label>
          <input className='input-img' type="file" id="fileInput" onChange={handleChange} />
          <label htmlFor="fileInput" className='imagecontainer'>
            {file ? (
              <div className="image-preview">
                <img src={newProduct.imageUrl} alt="Preview" />
              </div>
            ) : (
              <FontAwesomeIcon className="file-label" style={{height:"200px", width:"90%"}} icon={faImage} />
            )}
            <br/>
          </label>
        </div>
        <button className='btn-pub' onClick={handleAddProduct}>Publish Now</button>
        <pre></pre>
      </div>
     </div>
      <h3 className='t2 bor cap-head'>Added Products</h3> <pre></pre>
      <div className="product-container">
        {products.map((product, index) => (
          product.userId === userId && (
            <div className="cont" key={product._id}>
              <div className="product det1">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Starting Bid: ₹{product.startingBid}</p>
                <p>Current Bid: ₹{product.currentBid}</p>
                {modifyProductId === product._id ? (
                  <div>
                    <label>Enter Your Modified Bid:</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        localStorage.setItem('bidAmount', e.target.value);
                      }}
                    />
                    <button onClick={() => handleConfirmModifyBid(product._id, bidAmount)}>
                      Confirm Modification
                    </button>
                  </div>
                ) : (
                  <button className='btn-card' onClick={() => handleModifyBid(product._id, product.currentBid)}>
                    Modify Bid
                  </button>
                )}
                <button className='btn-card' onClick={() => handleDeleteProduct(product._id)}>Delete Product</button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default BiddingPage;
