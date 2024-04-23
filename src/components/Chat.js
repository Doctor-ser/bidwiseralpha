import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Chat({ loadMessage, setLoadMessage }) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState({
    email: userId,
  });
  const { productId } = useParams();
  const [proid, setProid] = useState(productId);

  // Define chatContainerRef using useRef
  const chatContainerRef = useRef(null);

  const fetchMessages = async () => {
    try {
      console.log("fetching messages for product ID:", proid);
      // Fetch product data along with messages
      const [messagesResponse, productResponse] = await Promise.all([
        fetch(`http://127.0.0.1:5500/api/get-messages?productId=${proid}`),
        fetch(`http://127.0.0.1:5500/api/fetchsellerbyproid/${proid}`)
      ]);
      const [messagesData, productData] = await Promise.all([
        messagesResponse.json(),
        productResponse.json()
      ]);

      if (messagesData.length === 0) {
        setMessages(['No messages to display']);
      } else {
        const messagesWithSellerInfo = messagesData.map(message => ({
          ...message,
          isSeller: message.senderEmail === productData.seller.userId
        }));
        setMessages(messagesWithSellerInfo);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const checkSeller = async () => {
    try {
      const productResponse = await fetch(`http://127.0.0.1:5500/api/fetchsellerbyproid/${proid}`);
      const productData = await productResponse.json();
  
      if (productData && productData.seller.userId === currentUser.email) {
        setCurrentUser(prevState => ({ ...prevState, isSeller: true }));
      }
    } catch (error) {
      console.error('Error checking seller:', error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const newMessageData = {
        content: newMessage,
        user: currentUser,
        productId: proid,
      };

      try {
        const response = await fetch('http://127.0.0.1:5500/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessageData),
        });

        if (response.ok) {
          setNewMessage('');
          fetchMessages();
        } else {
          console.error('Error sending message:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
    setProid(productId);
    checkSeller();
  }, [productId, loadMessage]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages update
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Global Chat</h2>
      <div className="message-list" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div className="message" key={index}>
            {message === 'No messages to display' ? (
              <p className="no-messages">No messages yet!</p>
            ) : (
              <>
                <div className="profile-container" style={{ backgroundColor: '' }}>
                  <p className="profile-info">
                    {message.senderEmail} 
                    {message.isSeller && <span className="seller-tag">(Seller)</span>}
                  </p>
                </div>
                <p className="message-content">{message.message}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
