import React, { useState, useEffect } from 'react';
import './chat.css';
import { useParams } from 'react-router-dom'; // Import useParams hook
import { useAuth } from './AuthContext'; // Import the useAuth hook


function Chat({loadMessage,setLoadMessage}) {
  const { userId } = useAuth(); // Get userId from useAuth

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState({
    email: userId, // Set email to userId obtained from useAuth
  });
  

  // Use useParams hook to access product ID from route
  const { productId } = useParams();
  const [proid, setProid] = useState(productId); // State to store product ID

  // Function to fetch messages from MongoDB (adjust API endpoint)
  const fetchMessages = async () => {
    try {
      console.log("fetching messages for product ID:", proid);
      const response = await fetch(`http://127.0.0.1:5500/api/get-messages?productId=${proid}`); // Include product ID in query string
      const data = await response.json();
      if (data.length === 0) {
        setMessages(['No messages to display']);
      } else {
        setMessages(data);
        console.log(data)
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  

  // Function to send a new message and store it in MongoDB
  const sendMessage = async () => {
    if (newMessage.trim()) {
      const newMessageData = {
        content: newMessage,
        user: currentUser,
        productId: proid,
      };
      console.log(newMessageData);
  
      try {
        console.log("sending message 2");
        const response = await fetch('http://127.0.0.1:5500/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessageData),
        });
        console.log("sending message 3");
  
        if (response.ok) {
          console.log("sending message 4");
          console.log(response);
          // Clear input field after successful message sending
          setNewMessage('');
  
          // Fetch updated messages after sending a new message
          fetchMessages();
        } else {
          console.error('Error sending message:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Handle keyboard press for Enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  // Fetch messages on component mount and set proid based on productId in route
  useEffect(() => {
    fetchMessages();
    setProid(productId); // Extract product ID from route and store in state
  }, [productId,loadMessage]); // Update proid only when productId changes
  

  return (
    <div className="chat-container">
      <h2>Global Chat</h2>
      <div className="message-list">
        {/* Map through messages, conditionally render a placeholder for empty state */}
        {messages.map((message, index) => (
          <div className="message" key={index}>
            {message === 'No messages to display' ? (
              <p className="no-messages">No messages yet!</p>
            ) : (
              // Render regular message content here
              <>
                <div className="profile-container">
                  <p className="profile-info">{message.senderEmail}</p>
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
