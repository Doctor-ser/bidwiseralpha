import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Plane } from '../svg/paper_plane.svg';
import { colors } from '@mui/material';

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
        fetch(`https://bidwiser.onrender.com/api/get-messages?productId=${proid}`),
        fetch(`https://bidwiser.onrender.com/api/fetchsellerbyproid/${proid}`)
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
          isCurrentUser: message.senderEmail === currentUser.email, // Add a flag to identify messages sent by the current user
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
      const productResponse = await fetch(`https://bidwiser.onrender.com/api/fetchsellerbyproid/${proid}`);
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
        const response = await fetch('https://bidwiser.onrender.com/api/send-message', {
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
      <h2 className='card-title ch-t'>Global Chat</h2>
      <p style={{marginBottom:"0px"}} className="message-list" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet!</p>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} />
            ))}
          </>
        )}
      </p>

      <span className="input-container">
        <input style={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '0' , border:"none",borderTop:" 1px solid #ccc"}}
          className='cht-i'
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write your message..."
        />
        <span style={{borderTop:" 1px solid #ccc",padding:"20px"}} onClick={sendMessage}><Plane width="25" height="25" /></span> 
      </span>
    </div>
  );
}

const MessageItem = ({ message }) => {
  const [senderName, setSenderName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSenderName = async () => {
      try {
        const response = await fetch(`https://bidwiser.onrender.com/api/fetchchatusername/${message.senderEmail}`);
        if (response.ok) {
          const userData = await response.json();
          const senderName = userData.username; // Adjust the property name based on your API response
          setSenderName(senderName);
        } else {
          console.error('Failed to fetch sender data');
        }
      } catch (error) {
        console.error('Error fetching sender data:', error);
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    fetchSenderName();
  }, [message.senderEmail]);

  return (
      <span style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: message.isCurrentUser ? 'flex-end' : 'flex-start' }}>
        {!message.isCurrentUser && (
          <span style={{ marginRight: '5px' }}>
            <FontAwesomeIcon icon={faUserCircle} className="c-ic left-icon" />
          </span>
        )}
        <span className={`message ${message.isCurrentUser ? 'sent-message' : 'regular-message'}`}>
          <span className={`message-content ${message.isCurrentUser ? 'right-align' : ''}`} style={{ overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>
            {message.message}
          </span>
        </span>
        {message.isCurrentUser && (
          <span style={{ marginLeft: '5px' }}>
            <FontAwesomeIcon icon={faUserCircle} className="c-ic right-icon" />
          </span>
        )}
      </span>
      <span style={{ display: 'flex', justifyContent: message.isCurrentUser ? 'flex-end' : 'flex-start' ,  marginLeft: "5px"}}>
        <span>
        <span className="c-un" style={{ textTransform: "uppercase",fontSize:"13px"}}>{senderName}</span>
        {message.isSeller && <span className="seller-tag" style={{fontSize:"13px"}}>&nbsp;(SELLER)</span>}
      </span>
      </span>
    </span>
  );
};

export default Chat;
