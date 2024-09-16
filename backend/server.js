require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Server } = require('socket.io');
const Grid = require('gridfs-stream');
const multer =require('multer')
const path = require('path');



const app = express();
mongoose.set("strictQuery", true)
//mongo uri
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;



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

const bidsChangeStream =  mongoose.connection.collection('bids').watch();
  // Listen for change events in the userbids collection
bidsChangeStream.on('change', (change) => {
  // Emit a Socket.IO event when a change is detected
  io.emit('bidChange'); // You can customize the event name and data as per your requirement
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

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('images'); // Name of the collection (you can change it as needed)
});

const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage });


// Define the Image model outside of route handlers
const Image = mongoose.model('Image', new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  metadata: { userId: String },
  image: { type: Buffer },
  imageUrl: String,
}));

// Endpoint to handle file upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    // console.log('Uploaded image:', req.file);

    const newImage = new Image({
      filename: req.file.originalname,
      size: req.file.size,
      contentType: req.file.mimetype,
      metadata: { userId: req.body.userId },
      image: req.file.buffer,
      imageUrl: req.body.imageUrl,
    });

    await newImage.save();

    res.json({ image: newImage });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Route to fetch image details based on imageUrl
app.get('/api/images/:imageUrl', async (req, res) => {
  try {
    const imageUrl = req.params.imageUrl;
    const imageDetails = await Image.findOne({ imageUrl });

    if (!imageDetails) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({buffer:imageDetails.image,contentType:imageDetails.contentType})

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Failed to fetch image' });
  }
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
    // console.log(topRatedComments);
    res.json({ topRatedComments });
  } catch (error) {
    console.error('Error fetching top-rated comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//chat

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

//fetch username using email
app.get('/api/fetchchatusername/:senderEmail', async (req, res) => {
  try {
    const senderEmail = req.params.senderEmail;

    // Find the user based on the sender email
    const user = await User.findOne({ email: senderEmail });

    if (user) {
      // If user found, send the username in the response
      res.json({ username: user.username });
    } else {
      // If user not found, send a 404 status with a message
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    // If any error occurs, send a 500 status with the error message
    console.error('Error fetching username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  service: 'gmail',
port:465,
secure:true,
  auth: {
    user: "bidwiser.help@gmail.com", //  email address
    pass: "golkxgygttxiftbi", //  Encrypted Password  app pass
  },
});


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  usertype: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true , limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));

//signup


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
    password,
    usertype: 'user'
  });

  newUser.save((err, user) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json({ message: 'User successfully registered!', user });
  });

    
});
//fetch the topcategories using userId
app.get('/api/top-categories/:userId', async (req, res) => {
  const email = req.params.userId;
  try {
    // Aggregate query to find top categories based on user ID
    const topCategories = await UserBid.aggregate([
      { $match: { userId: email } }, // Match bids for the given user ID
      { $group: { _id: '$category', count: { $sum: 1 }, latestBidId: { $max: '$_id' } } }, // Group bids by category and count occurrences, also get the latest bid ObjectId
      { $sort: { count: -1, latestBidId: -1 } }, // Sort by count and latest bid ObjectId in descending order
      { $limit: 1 } // Limit to top 1 categories
    ]);
    // Extract only category names from the result
    const categories = topCategories.map(category => category._id);
    res.json({ topCategories: categories });
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//fetch by email
app.get('/api/getUserByEmail/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email in the Users collection and only return the username
    const user = await User.findOne({ email }, { username: 1, _id: 0 });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return only the username
    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//fetch user details
app.get('/api/getUserDetails/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Find user by email in the database
    const user = await User.findOne({ email });

    if (user) {
      // User found, send user details
      res.json({ userDetails: user });
    } else {
      // User not found
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    // Error occurred while fetching user
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//fetch user bids
app.get('/api/getBidsByUser/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Find bids by user email in the database
    const bids = await Bid.find({ userId: email });

    if (bids) {
      // Bids found, send bid details
      res.json({ userBids: bids });
    } else {
      // No bids found for the user
      res.status(404).json({ message: 'No bids found for the user' });
    }
  } catch (error) {
    // Error occurred while fetching bids
    console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/users/:email', async (req, res) => {
  const userEmail = req.params.email;

  try {
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    
    // If the user is not found, respond with an error message
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is an admin
    if (user.usertype === 'admin') {
      return res.status(403).json({ error: 'You cannot delete an admin' });
    }

    // If the user is a regular user, delete the user
    await User.deleteOne({ email: userEmail });
    
    // Respond with a success message
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//fetch all feedbacks
app.get('/api/feedbacks', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.send(feedbacks);
});


//change password for admin
app.post('/api/changePassword', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  const email=userId;
  // console.log(req.body);
  try {
      // Find the user by email
      const user = await User.findOne({ email });
      // console.log(user);
      // Check if the user exists
      if (!user) {
        console.log("user not found");
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the old password matches the one stored in the database
      if (user.password !== oldPassword) {
        console.log("invalid password");
          return res.status(401).json({ message: 'Invalid old password' });
      }

      // Change the password
      user.password = newPassword;

      // Save the updated user
      await user.save();
      console.log("password changed");
      res.status(200).json({ message: 'Password successfully changed' });
  } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


//add admin
// Route to add admin
app.post('/api/addAdmin', async (req, res) => {
  const { username, email, password } = req.body;
  // Check if the email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
      return res.status(409).json({ message: 'Email already exists in the database' });
  }
  // If the email doesn't exist, proceed to create a new admin
  const newAdmin = new User({
      username,
      email,
      password,
      usertype: 'admin' // Set usertype to "admin"
  });
  newAdmin.save((err, admin) => {
      if (err) {
          return res.status(500).send(err);
      }

      //mail on adding
      const mailOptions = {
          from: 'bidwiser.help@gmail.com',
          to: email,
          subject: 'Welcome to BidWiser - Online Auction System',
          html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
              <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color: black; width: 100%; height: 40px;">Welcome to BidWiser</h1>
              <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Dear '${username}',</p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">I am pleased to inform you that you have been selected as an administrator for our website BidWiser! </strong></p>
              <p style="font-family: Arial, sans-serif; font-size: 18px; color: #333;font-weight:bold">Congratulations!</p>
              <pre>
          </pre>
              <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you,</p>
              <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">BidWiser Team</p>
          </div>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              // console.error('Error sending welcome email:', error);
              return res.status(500).json({ message: 'Internal server error' });
          }
      });

      // Send the response with the admin object included
      res.status(200).json({ message: 'Admin successfully added!', admin });
  });
});



app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Email does not exist' });
    }

    // Verify the password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Check the usertype
    if (user.usertype === 'user') {
      // If the user is a regular user, redirect to the regular user page
      return res.status(200).json({ message: 'Login successful', userType: 'user' });
    } else if (user.usertype === 'admin') {
      // If the user is an admin, redirect to the admin page
      return res.status(200).json({ message: 'Login successful', userType: 'admin' });
    } else {
      // Handle other usertypes if needed
      return res.status(401).json({ message: 'Unauthorized user' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
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
  
  //fetch username 
  const username = user.username;
  // Send an email with the new password
  const mailOptions = {
    from: 'bidwiser.help@gmail.com', // Sender email address
    to: email,
    subject: 'Password Reset',
    html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
            <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color: black; width: 100%; height: 40px;">Password Reset</h1>
          	<p style="font-family: Arial, sans-serif; font-size: 16px; font-weight:bold;">Dear ${username},</p><pre></pre>
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Your account has been notified of a <strong>Forgotten Password</strong> request.</p>
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">The New Password for your account is: <strong>${newPassword}</strong>.<br/>You can change your password once you have logged into your account.</p>
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Please do not share your password with third parties.</p>
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you for using our Online Auction System BidWiser.</p><pre>
      </pre>
            <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you,</p>
            <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">BidWiser Team</p>
          </div>`,
};


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // console.log('Email sent:', info.response);
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
  category: String,
  description: String,
  startingBid: Number,
  currentBid: Number, // Add this field
  endTime: Date,
  userId: String, // Add this field to associate a product with a user
  imageUrl: String,

});

const Bid = mongoose.model('Bid', bidSchema);

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/api/addBid', (req, res) => {
  const { name,category, description, startingBid, endTime, currentBid, imageUrl } = req.body;

  // Check if endTime is less than the current time
  if (new Date(endTime) < new Date()) {
    // console.log("End time should be in the future");
    return res.json('End time should be in the future');
  }

  const newBid = new Bid({
    name,
    category,
    description,
    startingBid,
    currentBid,
    endTime,
    userId: req.body.userId,
    imageUrl,
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
  console.log("newBid",newBid);
  console.log("currentBid",currentBid);
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
    const userbids = await UserBid.find({ productId: bidId, isWinningBid: true });

if (userbids.length > 0) {
  for (const userbid of userbids) {
    const userId = userbid.userId;
    const user = await User.find({email : userId});
    const username = user[0].username;
    
    // Mail the winner
    const mailOptions = {
      from: 'bidwiser.help@gmail.com',
      to: userId, // Assuming userId contains the email
      subject: 'Modification By Seller!',
      html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
              <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color: #FF0000; width: 100%; height: 40px;">Product Price Modified!</h1>
              <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Hello '${username}',</p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">The Seller have changed Starting value to &nbsp;<strong>${currentBid}</strong> for product &nbsp;<strong>'${userbids[0].productName}'</strong>.<br/></p>
               <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you for choosing BidWiser!</p>
  <pre>
        </pre>
              <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you,</p>
              <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">BidWiser Team</p>
            </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Update isWinningBid to false for this userbid
    userbid.isWinningBid = false;
    await userbid.save();
  }
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

//delete bid
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


//topdealactive productfetch
app.get('/api/active-products', async (req, res) => {
  try {
    // Get current timestamp
    const currentTime = new Date();

    // Find all active products (products without an end time or with an end time in the future)
    const activeProducts = await Bid.find({ $or: [{ endTime: { $exists: false } }, { endTime: { $gte: currentTime } }] });

    // Return the list of active products
    res.json({ activeProducts });
  } catch (error) {
    console.error('Error fetching active products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//fetching topdeal
app.get('/api/top-deal', async (req, res) => {
  try {
    
    // Aggregation pipeline to find the product with the most bids
    const topDeal = await UserBid.aggregate([
      // Group by productId and count the number of bids for each product
      { $group: { _id: '$productId', bidCount: { $sum: 1 } } },
      // Sort products by bid count in descending order
      { $sort: { bidCount: -1 } }
    ]);
    console.log(topDeal);

    let topProductDetails;
    let i = 0;

    // Find the top deal with the end time in the future
    while (i < topDeal.length) {
      // Get the productId of the top deal
      const topProductId = topDeal[i]._id;
      

      // Find the details of the top deal from the 'bids' collection
      topProductDetails = await Bid.findOne({ _id: topProductId });

      // Check if the top product details are found and not null
      if (topProductDetails && new Date(topProductDetails.endTime) > new Date()) {
        // If the end time is in the future, break the loop
        break;
      }

      // Increment the index to find the next top deal
      i++;
    }

    if (i < topDeal.length && topProductDetails) {
      // Return the top deal details if found
      console.log(topProductDetails)
      res.json({ topDeal: topProductDetails});
    } else {
      // If no active top deal is found, return an empty response or handle the case as needed
      res.json({ message: 'No active top deal found' });
    }
  } catch (error) {
    console.error('Error fetching top deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//fetch the bid by product id
app.get('/api/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Bid.findById(productId);
    // console.log(product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/products/by-category', async (req, res) => {
  const { category, productId } = req.body;
  // console.log("which categoryy", category);
  // console.log("productId", productId);

  try {
    const currentTime = new Date();

    // Find the three most recent live products in the specified category
    const recentProducts = await Bid.aggregate([
      { $match: {
        category,
        endTime: { $gt: currentTime } // Filter products where endTime is greater than current time
      } },
      { $sort: { endTime: -1 } },
      { $limit: 3 },
      { $project: { name: 1, currentBid: 1, imageUrl: 1, _id: 1 } }
    ]);

    // Convert _id to a string for reliable comparison
    const filteredProducts = recentProducts.filter(product => String(product._id) !== productId);

    //console.log(filteredProducts);
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching recent products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









//fetch bids price after winning the product by product id
app.get('/api/fetchprice/:proid', async (req, res) => {
  const productId = req.params.proid;
  // console.log(productId);
  try {
      // Fetch the bid details from the database based on the product ID
      const bid = await Bid.findOne({ _id: productId });

      if (!bid) {
          return res.status(404).json({ success: false, message: 'Bid not found' });
      }

      // If the bid is found, send back the name and current bid
      res.json({ success: true, name: bid.name, currentBid: bid.currentBid });
  } catch (error) {
      console.error('Error fetching bid details:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//fetching seller
//fetch the seller by product id
app.get('/api/fetchsellerbyproid/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Bid.findById(productId);
    // console.log(product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, seller: { userId: product.userId } });
  } catch (error) {
    console.error('Error fetching seller details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      // console.log(averageRating,sortedFeedbacks)
      // Send the average rating and top 5 feedbacks in the response
      res.json({ averageRating, feedbacks: top5Feedbacks });
    }
  } catch (error) {
    console.error('Error fetching user ratings and feedbacks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product feedback by _id
app.put('/api/productfeedbacks/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, feedback } = req.body;
    const updatedFeedback = await ProductFeedback.findOneAndUpdate({ productId }, { rating, feedback }, { new: true });
    //console.log(updatedFeedback);
    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating product feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//fetch the feedback of the product
app.get('/api/productfeedbacksfetch/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Fetch product feedback from the database based on productId
    const feedback = await ProductFeedback.find({ productId }, { feedback: 1, rating: 1 ,_id: 0});

    // If no feedback is found, return a 404 error
    if (!feedback.length) {
      return res.status(404).json({ error: 'No feedback found for the given productId' });
    }

    // If feedback is found, return it in the response
    //console.log(feedback);
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching product feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//get product names
app.get('/api/getProductFeedback/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find product feedbacks for the provided userId
    const productFeedbacks = await ProductFeedback.find({ userId });

    // Extract unique product names from feedbacks
    const productNames = Array.from(new Set(productFeedbacks.map(feedback => feedback.productName)));

    // Extract feedback and rating for each product
    const productData = await Promise.all(productNames.map(async (productName) => {
      const feedbackData = productFeedbacks.filter(feedback => feedback.productName === productName);
      const ratings = feedbackData.map(feedback => feedback.rating);
      const productIds = feedbackData.map(feedback => feedback.productId);

      // Fetch imageUrls for each productId from the Bids collection
      const imageUrls = await Promise.all(productIds.map(async (productId) => {
        const bid = await Bid.findOne({ _id: productId });
        return bid ? [bid.imageUrl] : []; // Return array with imageUrl if bid exists, otherwise empty array
      }));

      return {
        productName,
        feedback: feedbackData.map(feedback => feedback.feedback),
        ratings,
        imageUrls
      };
    }));

    res.json({ productData });
  } catch (error) {
    console.error('Error fetching product feedback:', error);
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
  // console.log(req.body);
  try {
    // Find the winning user based on productId and isWinningBid being true
    const winningUserBid = await UserBid.findOne({ productId, isWinningBid: true });
    // console.log(winningUserBid.userId);
    if (!winningUserBid) {
      return res.status(404).json({ message: 'Winning user not found for the specified product' });
    }

    const winnerEmail = winningUserBid.userId; // Extract the winner's email (userId)
    const user = await User.findOne({ email: winnerEmail });
    const username = user.username;
    // Check if the email has already been sent
    if (winningUserBid.mailsend) {
      return res.status(400).json({ message: 'Email already sent to winner' });
    }

    const mailOptions = {
      from: 'bidwiser.help@gmail.com',
      to: winnerEmail,
      subject: 'Congratulations! You Won the Bid',
      html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
              <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color:black; width: 100%; height: 40px;">Congratulations!</h1>
              <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Dear ${username},</p><pre> </pre>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;"><strong>Congratulations! </strong><br/>You have won the bid that you put on &nbsp;<strong>"${productName}"&nbsp;</strong> with the bid amount of&nbsp; <strong>₹${winningBid}</strong>.
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you for participating in the auction.</p><pre> </pre>
              <p style="font-weight: bold;font-family: Arial, sans-serif; font-size: 16px; color: #333;">Sincerely,</p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333;">BidWiser Team</p>
            </div>`,
  };
  

    await transporter.sendMail(mailOptions);
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
  category: String,
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
    // console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//fetch the winner using product id if the mailsend true and isWinningBid true
app.get('/api/products/:productId/winner', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the highest bid for the given product where isWinningBid is false and mailsend is false
    const highestBid = await UserBid.findOne({ productId, isWinningBid: true}).sort({ bidAmount: -1 }).limit(1);

    if (!highestBid) {
      return res.status(404).json({ success: false, message: 'No bids found for this product' });
    }

    // Fetch the user information of the highest bidder
    const winner = await User.findOne({ email: highestBid.userId });

    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner not found' });
    }

    // Return the winner's information
    res.json({ success: true, winner: { email: winner.email, bidAmount: highestBid.bidAmount } });
  } catch (error) {
    // console.error('Error fetching winner:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



//place bid 
app.post('/api/placeBid', async (req, res) => {
  const { productId, userId, bidAmount ,category} = req.body;
  // console.log("Recieved data",req.body);
  console.log('category:',category);
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
      const previousWinnerUserId = previousWinningBid.userId;
      const user = await User.findOne({ email: previousWinnerUserId });
      const username = user.username;
      if (previousWinnerUserId === userId) {
        // console.log("You are already the winning bidder");
        return res.status(400).json({ message: 'You are already the winning bidder' });
      }
      const previousWinningBidAmount = previousWinningBid.bidAmount;
      const productName = previousWinningBid.productName;

      const mailOptions = {
        from: 'bidwiser.help@gmail.com',
        to: previousWinnerUserId, // Assuming userId contains the email
        subject: 'You have been outbid!',
        html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
                <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color: #FF0000; width: 100%; height: 40px;">You have been OUTBIDDED!</h1>
                <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Hello '${username}',</p>
                <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">You have been outbid for the product &nbsp;<strong>'${productName}'</strong>.<br/> Your Previous Bid Amount:&nbsp; <strong>${previousWinningBidAmount}</strong>, <br/>New Bid Amount: &nbsp;<strong>${bidAmount}</strong></p>
                 <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you for choosing BidWiser!</p>
    <pre>
          </pre>
                <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you,</p>
                <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">BidWiser Team</p>
              </div>`,
    };
    

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      // Mark the previous winning bid as not winning
      previousWinningBid.isWinningBid = false;
      await previousWinningBid.save();
    }

    // Update the current bid for the product
    product.currentBid = bidAmount;
    await product.save();

    // Add user bid
    const newUserBid = new UserBid({
      productId,
      category,
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
    // console.error('Error placing bid:', error);
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
    // console.error('Error fetching winning bid details:', error);
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
    // console.error('Error fetching bids:', error);
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
    // console.error('Error fetching product:', error);
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
    // console.error('Error fetching total bids:', error);
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
    // console.error('Error fetching total products:', error);
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
    // console.error('Error fetching winning bids:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add this endpoint to your server code
app.post('/api/sendWelcomeEmail', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  const username =user.username;
  // Send welcome email logic here
  const mailOptions = {
    from: 'bidwiser.help@gmail.com',
    to: email,
    subject: 'Welcome to BidWiser - Online Auction System',
    html: `<div style="border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; ">
            <h1 style="margin-bottom: 40px; padding: 20px 0; font-family: Arial, sans-serif; color: white; text-align: center; background-color: black; width: 100%; height: 40px;">Welcome to BidWiser</h1>
            <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Dear '${username}',</p>
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Welcome to BidWiser, the epitome of online auctions. Unleash excitement with innovative features.<br/>Bid confidently on your favorite items, as every click opens a gateway to unparalleled bidding experiences. <br/><strong>Let the journey begin!</strong></p>
            <p style="font-family: Arial, sans-serif; font-size: 18px; color: #333;font-weight:bold">Thank you for choosing BidWiser!</p>
            <pre>
      </pre>
            <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Thank you,</p>
            <p style="font-weight: bold; font-family: Arial, sans-serif; font-size: 16px; color: #333;">BidWiser Team</p>
          </div>`,
};

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.error('Error sending welcome email:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // console.log('Welcome email sent:', info.response);
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
  //console.log('A user connected with id : ' + socket.id);

  socket.on('disconnect', () => {
   // console.log('User disconnected');
  });

  
});
