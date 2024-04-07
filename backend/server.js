require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Server } = require('socket.io');



const app = express();
mongoose.set("strictQuery", true)
// Connect to MongoDB (replace this URI with your actual MongoDB URI)
mongoose.connect("mongodb+srv://johangeorge2002:johan14_1@cluster0.fzep1k0.mongodb.net/bidwiser?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

mongoose.connection.once("open",()=>{

  const userBidsChangeStream =  mongoose.connection.collection('userbids').watch();
  // Listen for change events in the userbids collection
userBidsChangeStream.on('change', (change) => {
  // Emit a Socket.IO event when a change is detected
  io.emit('userBidChange'); // You can customize the event name and data as per your requirement
});

})


const corsOptions = {//for localhost on local machine use http://localhost:3000
  origin: 'http://localhost:3000', // Replace with your React app's domain //use for deployed frontend
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));

// Example middleware to set no-cache headers
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', 0);
  next();
});


//Feedback
const feedbackSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  userId: String // Add userId to associate feedback with a user
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Endpoint to handle feedback submission
app.post('/api/feedback', async (req, res) => {
  try {
    // Extract feedback data from request body
    const { rating, comment, userId } = req.body;

    // Create new feedback document
    const newFeedback = new Feedback({
      rating,
      comment,
      userId
    });

    // Save feedback to the database
    await newFeedback.save();

    // Respond with success message
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Respond with error status and message
    res.status(500).json({ message: 'Failed to submit feedback. Please try again later.' });
  }
}); 


//average rating
app.get('/api/feedback/average', async (req, res) => {
  try {
    // Calculate average rating using MongoDB aggregation
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Extract the average rating from the result
    const averageRating = result.length > 0 ? result[0].averageRating : 0;

    // Respond with the average rating
    res.status(200).json({ averageRating });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    // Respond with error status and message
    res.status(500).json({ message: 'Failed to calculate average rating. Please try again later.' });
  }
});

//top messages
app.get('/api/topRatedComments', async (req, res) => {
  try {
    // Fetch last 5 top-rated comments based on rating and insertion time
    const topRatedComments = await Feedback.find()
      .sort({ rating: -1, _id: -1 })
      .limit(5);
    console.log(topRatedComments);
    res.json({ topRatedComments });
  } catch (error) {
    console.error('Error fetching top-rated comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






//chat


// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// app.use(express.json());
// const PORT = 3000;
// const MONGO_URI = 'mongodb://localhost:27017/bidwiser';
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

const messageSchema = new mongoose.Schema({
  senderEmail: String,
  message: String,
  productId: String,
});

const Message = mongoose.model('Message', messageSchema);

app.post('/api/send-message', async (req, res) => {
  try {
    const { content, user, productId } = req.body;

    // Extract sender email from the user object
    const senderEmail = user.email;

    // Create a new message document
    const newMessage = new Message({
      senderEmail,
      message: content,
      productId,
    });

    // Save the new message to the database
    await newMessage.save();

    console.log('Message saved:', newMessage);
    
    // Respond with success message
    io.emit('new-message');
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Respond with error status and message
    res.status(500).json({ message: 'Error sending message' });
  }
});


//fetch messages
app.get('/api/get-messages', async (req, res) => {
  try {
    const { productId } = req.query;

    const messages = await Message.find({ productId }).sort({ createdAt: 1 }); // Filter by productId and sort by creation time
    console.log(messages);
    console.log("all messages printed");

    // Extract senderEmail and message from each message object
    const simplifiedMessages = messages.map(message => ({
      senderEmail: message.senderEmail,
      message: message.message
    }));

    res.json(simplifiedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});





// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  service: 'gmail',
port:465,
secure:true,
  auth: {
    user: "johxngeorxe@gmail.com", //  email address
    pass: "nraetzgwnhfmppbh", //  Encrypted Password
  },
});


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true , limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));



app.post('/api/signup', async(req, res) => {
  const { username, email, password } = req.body;
  //console.log(req.body)
  
  // Check if the email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists in the database' });
  }

// If the email doesn't exist, proceed to create a new user
  const newUser = new User({
    username,
    email,
    password
  });

  newUser.save((err, user) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json({ message: 'User successfully registered!', user });
  });

    
});



app.post('/api/login', async(req, res) => {
  const { email, password } = req.body;

  
  // Check if user with provided email exists in the database
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (!user) {
      return res.status(401).json({ message: 'Email does not exist' });
    }

    // Now, verify the password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({ message: 'Login successful' });
  });
});



app.post('/api/forgotPassword', async (req, res) => {
  const { email } = req.body;

  try{ 
  // Check if the email exists in the database
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'Email not found' });
  }

  // Generate a new password (you may want to use a library like `crypto` for more security)
  const newPassword = crypto.randomBytes(8).toString('hex'); // Implement this function

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database
  user.password = newPassword;
  await user.save();

  // Send an email with the new password
  const mailOptions = {
    from: 'johxngeorxe@gmail.com', // Sender email address
    to: email,
    subject: 'Password Reset',
    text: `Dear user, we have received a forgot password request for your account. Your new password is: ${newPassword} Please do not share your password with anyone. We thank you for using our Online Auction System BidWiser.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    console.log('Email sent:', info.response);
    return res.status(200).json({ message: 'Email sent successfully' });
  });
} catch (error) {
  console.error('Error:', error);
  return res.status(500).json({ message: 'Internal server error' });
}
});


//bidding schema
const bidSchema = new mongoose.Schema({
  name: String,
  description: String,
  startingBid: Number,
  currentBid: Number, // Add this field
  endTime: Date,
  userId: String, // Add this field to associate a product with a user
});

const Bid = mongoose.model('Bid', bidSchema);

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/api/addBid', (req, res) => {
  const { name, description, startingBid, endTime,currentBid } = req.body;

  const newBid = new Bid({
    name,
    description,
    startingBid,
    currentBid, // Save the current bid
    endTime,
    userId: req.body.userId, // Include the userId
  });

  newBid.save((err, bid) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json({ message: 'Bid added successfully', bid });
  });
});

app.put('/api/modifyBid/:id', async (req, res) => {
  const bidId = req.params.id;
  const { newBid, currentBid } = req.body;

  try {
    // Fetch the bid
    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bidding has ended
    if (bid.endTime && new Date(bid.endTime) < new Date()) {
      return res.status(400).json({ message: 'Bidding for this product has already ended. Modification not allowed.' });
    }

    // Update startingBid and currentBid
    bid.startingBid = newBid;
    bid.currentBid = currentBid;

    // Save the updated bid
    const updatedBid = await bid.save();

    res.status(200).json({ message: 'Bid modified successfully', bid: updatedBid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.delete('/api/deleteBid/:id', async (req, res) => {
  try {
    const bidId = req.params.id;
    const bid = await Bid.findById(bidId);

    if (bid.endTime && new Date(bid.endTime) < new Date()) {
      return res.status(400).json({ message: 'Bidding for this product has already ended. Deletion not allowed.' });
    }
    const deletedBid = await Bid.findByIdAndRemove(bidId);

    if (!deletedBid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    res.status(200).json({ message: 'Bid deleted successfully', bid: deletedBid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//feedback product details fetch
app.get('/api/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Fetch only the necessary fields from the bids collection using the provided productId
    const product = await Bid.findById(productId, 'name currentBid userId');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//for saving to new collection for product feedback
const productFeedbackSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  userId: String,
  rating: Number,
  feedback: String,
});

const ProductFeedback = mongoose.model('ProductFeedback', productFeedbackSchema);

//to calculate average rating for the seller
app.get('/api/userratings/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find all feedbacks for the provided userId
    const userFeedbacks = await ProductFeedback.find({ userId });

    if (userFeedbacks.length === 0) {
      // If no feedbacks found for the user, return empty array
      console.log("no user found for the feedback")
      res.json({ averageRating: 0, feedbacks: [] });
    } else {
      // Calculate average rating for the user
      const totalRating = userFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = totalRating / userFeedbacks.length;

      // Sort feedbacks based on rating in descending order
      const sortedFeedbacks = userFeedbacks.sort((a, b) => b.rating - a.rating);

      // Get top 5 feedbacks
      const top5Feedbacks = sortedFeedbacks.slice(0, 5);
      console.log(averageRating,sortedFeedbacks)
      // Send the average rating and top 5 feedbacks in the response
      res.json({ averageRating, feedbacks: top5Feedbacks });
    }
  } catch (error) {
    console.error('Error fetching user ratings and feedbacks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//get product names
app.get('/api/getProductNames/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find product feedbacks for the provided userId
    const productFeedbacks = await ProductFeedback.find({ userId });

    // Extract unique product names from feedbacks
    const productNames = Array.from(new Set(productFeedbacks.map(feedback => feedback.productName)));

    res.json({ productNames });
  } catch (error) {
    console.error('Error fetching product names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to add product feedback
app.post('/api/productfeedbacks', async (req, res) => {
  try {
    const { productId, productName , userId, rating, feedback } = req.body;

    // Create a new product feedback document
    const newProductFeedback = new ProductFeedback({
      productId,
      productName,
      userId,
      rating,
      feedback,
    });

    // Save the product feedback to the database
    const savedProductFeedback = await newProductFeedback.save();

    res.status(201).json(savedProductFeedback);
  } catch (error) {
    console.error('Error adding product feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//mail to winner 
app.post('/api/sendEmailToWinner', async (req, res) => {
  const { productName, winningBid, productId } = req.body;
  console.log(req.body);
  try {
    // Find the winning user based on productId and isWinningBid being true
    const winningUserBid = await UserBid.findOne({ productId, isWinningBid: true });
    console.log(winningUserBid.userId);
    if (!winningUserBid) {
      return res.status(404).json({ message: 'Winning user not found for the specified product' });
    }

    const winnerEmail = winningUserBid.userId; // Extract the winner's email (userId)

    // Check if the email has already been sent
    if (winningUserBid.mailsend) {
      return res.status(400).json({ message: 'Email already sent to winner' });
    }

    // const mailOptions = {
    //   from: 'johxngeorxe@gmail.com',
    //   to: winnerEmail,
    //   subject: 'Congratulations! You are the winning bidder',
    //   text: `Dear ${winnerEmail},\n\nCongratulations! You have won the bid for "${productName}" with a bid amount of ₹${winningBid}.\n\nThank you for participating in the auction.\n\nSincerely,\nYour Auction Platform`
    // };

    // await transporter.sendMail(mailOptions);
    // console.log('Email sent to winner:', winnerEmail);

    // Update mailsend flag to true
    await UserBid.updateOne({ _id: winningUserBid._id }, { $set: { mailsend: true } });

    res.status(200).json({ message: 'Email sent to winner successfully' });
  } catch (error) {
    console.error('Error sending email to winner:', error);
    res.status(500).json({ message: 'Error sending email to winner' });
  }
});







// user bid schema //
const userBidSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  userId: String,
  bidAmount: Number,
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }, // Reference to the bid in the Bid collection
  productName: String, // Add the product name property
  isWinningBid: { type: Boolean, default: false },
  mailsend: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const UserBid = mongoose.model('UserBid', userBidSchema);

app.post('/api/addUserBid', async(req, res) => {
  const { productId, userId, bidAmount } = req.body;

  try {
    // Fetch the product
    const product = await Bid.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

  const newUserBid = new UserBid({
    productId,
    userId,
    bidAmount,
    bidId: product._id,
    productName: product.name, // Save the product name
    timestamp: new Date(),
  });
  await newUserBid.save();

  res.status(200).json({ message: 'User bid added successfully', userBid });
  } catch (error) {
    console.error('Error adding user bid:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/getUserBids/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const userBids = await UserBid.find({ userId }).populate('bidId' , 'productId');
    res.status(200).json({ userBids });
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//place bid 
app.post('/api/placeBid', async (req, res) => {
  const { productId, userId, bidAmount } = req.body;
  console.log("Recieved data",req.body);
  try {
    // Fetch the product
    const product = await Bid.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if bidAmount is greater than the currentBid
    if (bidAmount <= product.currentBid) {
      return res.status(400).json({ message: 'Bid amount must be greater than the current bid' });
    }

    // Identify the previous winning bid and mark it as not winning
    const previousWinningBid = await UserBid.findOne({ productId, isWinningBid: true });
    if (previousWinningBid) {
      previousWinningBid.isWinningBid = false;
      await previousWinningBid.save();
    }

    // Update the current bid for the product
    product.currentBid = bidAmount;
    await product.save();

    // Add user bid
    const newUserBid = new UserBid({
      productId,
      userId,
      bidAmount,
      productName: product.name,
      bidId: product._id,
      isWinningBid: true, // Mark the current bid as winning
      timestamp: new Date(), // Add this line to include the timestamp
    });

    await newUserBid.save();

    res.status(200).json({ message: 'Bid placed successfully' });
  } catch (error) {
    console.error('Error placing bid:', error);
    // Handle the error and respond to the client
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add a new endpoint to get winning bid details for a specific product
app.get('/api/getWinningBid/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the winning bid for the specified product
    const winningBid = await UserBid.findOne({ productId, isWinningBid: true }).select('userId');

    // Check if a winning bid is found
    if (!winningBid) {
      return res.status(404).json({ message: 'Winning bid not found for the specified product' });
    }

    res.status(200).json({ winningBid });
  } catch (error) {
    console.error('Error fetching winning bid details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new endpoint to fetch bids
app.get('/api/getBids', async (req, res) => {
  try {
    const userId = req.query.userId; // Get the user ID from the query parameter
     // Fetch only the products associated with the logged-in user
     const bids = await Bid.find(); // Fetch only the bids associated with the logged-in user
    res.status(200).json({ bids });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/getUserId', (req, res) => {
  // Get the user ID from your authentication system
  // For simplicity, you can return a dummy user ID here
  const userId = req.query.email;
  res.status(200).json({ userId });
});

// Add a new endpoint to fetch a specific product by ID
app.get('/api/getBids/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Bid.findById(productId);
    res.status(200).json({ bids: [product] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add these endpoints to your server code

// Endpoint to get total number of bids placed by a user
app.get('/api/getTotalBids/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const totalBids = await UserBid.countDocuments({ userId });
    res.status(200).json({ totalBids });
  } catch (error) {
    console.error('Error fetching total bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get total number of products listed by a user
app.get('/api/getTotalProducts/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const totalProducts = await Bid.countDocuments({ userId });
    res.status(200).json({ totalProducts });
  } catch (error) {
    console.error('Error fetching total products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get the number of winning bids for a user
app.get('/api/getWinningBids/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const winningBids = await UserBid.countDocuments({ userId, isWinningBid: true });
    res.status(200).json({ winningBids });
  } catch (error) {
    console.error('Error fetching winning bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add this endpoint to your server code
app.post('/api/sendWelcomeEmail', async (req, res) => {
  const { email } = req.body;

  // Send welcome email logic here
  const mailOptions = {
    from: 'johxngeorxe@gmail.com',
    to: email,
    subject: 'Welcome to BidWiser - Online Auction System',
    text: `Dear user, Welcome to BidWiser, the ultimate online auction system. Explore exciting features and start bidding on your favorite items. Thank you for choosing BidWiser!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending welcome email:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    console.log('Welcome email sent:', info.response);
    return res.status(200).json({ message: 'Welcome email sent successfully' });
  });
});

const { createServer } = require('node:http');
const { create } = require('domain');
const port = process.env.PORT || 5500;

const server = createServer(app);

  const io = new Server(server, { cors: { origin: 'http://localhost:3000' } }); 

server.listen(port, () => {
  console.log("Server is started on port " + port);
});



//socket.io server side events
io.on('connection', (socket) => {
  console.log('A user connected with id : ' + socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  
});