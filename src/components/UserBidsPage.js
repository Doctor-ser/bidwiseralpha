import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import './homepage.css';
import Buynow from './Buynow';
import { height, margin } from '@mui/system';

const UserBidsPage = () => {
  const [userBids, setUserBids] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredBids, setFilteredBids] = useState([]);
  const [filterOption, setFilterOption] = useState('all');
  const auth = useAuth();
  const userId = auth.userId;

  useEffect(() => {
    const fetchUserBids = async () => {
      try {
        if (userId) {
          const userBidsResponse = await axios.get(`https://bidwiser.onrender.com/api/getUserBids/${userId}`);
          setUserBids(userBidsResponse.data.userBids);
          filterBids(userBidsResponse.data.userBids);
        }
      } catch (error) {
        console.error('Error fetching user bids:', error);
      }
    };
    fetchUserBids();
    
  }, [userId, filterOption]);

  const filterBids = (bids) => {
    let filtered = bids;
    if (searchInput) {
      filtered = bids.filter((bid) => {
        return (
          bid.productName.toLowerCase().includes(searchInput.toLowerCase()) ||
          bid.bidAmount.toString().includes(searchInput)
        );
      });
    }

    if (filterOption === 'winning') {
      filtered = filtered.filter((bid) => bid.isWinningBid);
    } else if (filterOption === 'won') {
      filtered = filtered.filter((bid) => bid.isWinningBid && bid.mailsend);
    }

    setFilteredBids(filtered);
  };

  const handleSearch = () => {
    filterBids(userBids);
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
  };

  const goToProductFeedback = (prodId) => {
    window.location.href = `/ProductFeedback/${prodId}`;
  };

  return (
    <div className="container mt-4">
      <h2>Your Bids</h2>
      <Row className="mb-4">
        <Col md={8}>
          <Form>
            <Form.Group controlId="searchInput" >
              <Form.Control
                style={{height:"45px",marginTop:"5px"}}
                type="text"
                placeholder="Search by product name or bid amount"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Form.Group>
          </Form>
          
        </Col>
        <Col md={2}>
          <Button variant="primary" style={{height:"45px",border:"none"}} className="btn-search" onClick={handleSearch}>
            Search
          </Button>
        </Col>
        <Col md={2}>
          <Form >
            <Form.Group controlId="filterDropdown">
              <Form.Select style={{height:"45px", marginTop:"5px"}} onChange={(e) => handleFilterChange(e.target.value)} value={filterOption}>
                <option value="all">All bids</option>
                <option value="winning">Winning bids</option>
                <option value="won">Won bids</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <div className="row">
        {filteredBids.map((bid) => (
          <div key={bid._id} className="win card-body text-center mx-auto col-md-4 mb-4">
            <Card className='card-f'>
              <Card.Body>
                <Card.Title>{bid.productName}</Card.Title>
                <Card.Text>
                  <strong>Product ID:</strong> {bid.productId}
                </Card.Text>
                <Card.Text>
                  <strong>Bid Amount:</strong> ₹{bid.bidAmount}
                </Card.Text>
                <Card.Text>
                  <strong>Bid Placed At:</strong> {new Date(bid.timestamp).toLocaleString()}
                </Card.Text>
                <Card.Text>
                  <strong>User ID:</strong> {bid.userId}
                </Card.Text>
                <Card.Text>
                  <strong>Winning Bid:</strong> {bid.isWinningBid ? 'Yes' : 'No'}
                </Card.Text>
                {bid.isWinningBid && bid.mailsend && (
                  <div className="text-center btx">
                    <Button variant="primary" className="btn btn-view x" onClick={() => goToProductFeedback(bid.productId)}>
                    Product Feedback
                    </Button>
                  </div>
                )}
                {bid.isWinningBid && bid.mailsend && (
                  <div className='gpay'>
                    <Buynow bidAmount={bid.bidAmount} />
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBidsPage;
