import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import './homepage.css';

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
          const userBidsResponse = await axios.get(`http://127.0.0.1:5500/api/getUserBids/${userId}`);
          setUserBids(userBidsResponse.data.userBids);
          filterBids(userBidsResponse.data.userBids);
        }
      } catch (error) {
        console.error('Error fetching user bids:', error);
      }
    };
    fetchUserBids();
    const intervalId = setInterval(fetchUserBids, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
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
            <Form.Group controlId="searchInput">
              <Form.Control
                type="text"
                placeholder="Search by product name or bid amount"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Col>
        <Col md={2}>
          <Button variant="primary" className="btn-search" onClick={handleSearch}>
            Search
          </Button>
        </Col>
        <Col md={2}>
          <Form>
            <Form.Group controlId="filterDropdown">
              <Form.Select onChange={(e) => handleFilterChange(e.target.value)} value={filterOption}>
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
          <div key={bid._id} className="col-md-4 mb-4">
            <Card>
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
  <Button variant="primary" className="feedback-btn" onClick={() => goToProductFeedback(bid.productId)}>
    Product Feedback
  </Button>
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