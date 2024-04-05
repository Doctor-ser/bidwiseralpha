import React, { useState, useEffect } from 'react';
import './homepage.css';
import { Link } from 'react-router-dom';

const HomePage = ({ darkMode }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    'https://cdn.mos.cms.futurecdn.net/AEYvg9hJbdXFmWL4XKPiHk.jpg',
    'https://wallpapercave.com/wp/wp9015587.jpg',
    'https://wallpapercave.com/wp/wp6827492.jpg',
    'https://dlcdnwebimgs.asus.com/files/media/2D9FA79D-3209-484C-AF03-F216728A289C/v2/images/large/1x/kv.webp',
    'https://wallpapercave.com/wp/wp8987916.jpg',
    'https://wallpapercave.com/wp/wp8257248.jpg',
    'https://wallpapercave.com/uwp/uwp3554900.jpeg',
    'https://wallpapercave.com/wp/wp6967920.jpg',
    'https://wallpapercave.com/wp/wp12468061.jpg',
    'https://wallpapercave.com/wp/wp5332711.jpg',
    'https://wallpapercave.com/wp/wp13479603.jpg',
    'https://wallpapercave.com/wp/wp12758397.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={`homepage-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className='banner'>
          <img src={images[currentImageIndex]} alt="Banner" className="banner-image" />
          <div className="banner-text">
            <h1>Welcome to bidwiser</h1>
            <p>
              Explore a seamless online auction experience with bidwiser. List your items
              with detailed descriptions and starting bids. Bid on exciting items and
              enjoy features like automated bidding and auction ending times.
            </p>
          </div>
        </div>

      <div className='main'>
        <div className='row'>
          <div className='col-md-6'>
            <h1 className="display-4">Revolutionizing Online Auction</h1>
            <p className="lead">
            Embark on a revolutionary auctioning journey with bidwiser's premier platform, boasting live global chat for dynamic interactions, intuitive bid addition for seamless engagement, and a comprehensive feedback system, all meticulously designed to set a new standard for online auctions.
            </p>
          </div>
          <div className='col-md-6'>
            <img src={images[currentImageIndex]} alt="Banner" height="400" width="600" />
          </div>
        </div>
    
      <section class="shop-banner">
    	<div class="container">
        	<h3>Get Amazing deals at Great Price <br/> with <span class="orange-text">BIDWISER....</span></h3><br/>
            <div class="sale-percent"><span>Place<br/>Your</span>BIDS NOW!!!<span></span></div>
            <Link to="/product" className="btn btn-primary1">
              Place Bids
            </Link>
        </div>
    </section>
    </div>
    </div>
  );
};

export default HomePage;
