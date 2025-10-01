About Us
Welcome to BidWiser, an innovative online auction platform designed to enhance the bidding experience. We are Group 8, a team of passionate developers working with the MERN stack to create a seamless, secure, and user-friendly auction system.


Team Members:
Alfin Joji
Ashwin V Mathew
Johan George
Evan T Abraham


Project Features:
Real-time Bidding using Socket.io for seamless interaction between buyers and sellers.
User Authentication ensuring secure login and bidding.
Product Listings with detailed descriptions and bidding options.
Top Deals feature to promote high-interest products.
Messaging System for direct communication with sellers.
Seller Rating System to help buyers make informed decisions.

#NOTE
we weren`t good in the front end design stuff ,and this project could be more optimised,there will me many warnings for not using variables. 
we have used env for port,mongodb uri(we used mongodbatlas for seamless access of images),username,passkey (app auth for mail config)
feel free to contact via linkedin for anydoubts 

Experience the live demo of BidWiser: https://bidwiser-1po.onrender.com

# bidwiseralpha

## Deployment Instructions

### Backend Deployment (Render)
1. Create a free account on [Render](https://render.com).
2. Connect your GitHub repository `bidwiseralpha`.
3. Create a new Web Service.
4. Set the build command to `npm install`.
5. Set the start command to `npm start`.
6. Add environment variables in Render dashboard:
   - `MONGO_URI` - Your MongoDB Atlas connection string.
   - `EMAIL_USER` - Your Gmail address for sending emails.
   - `EMAIL_PASS` - Your Gmail app password.
   - `FRONTEND_URL` - The URL of your deployed frontend (e.g., Vercel URL).
7. Deploy the backend service.

### Frontend Deployment (Vercel)
1. Create a free account on [Vercel](https://vercel.com).
2. Connect your GitHub repository `bidwiseralpha`.
3. Deploy the React app from the root directory.
4. After deployment, get the frontend URL.

### Final Steps
- Update the `FRONTEND_URL` environment variable in Render with your frontend URL.
- Redeploy the backend service.
- Test the live site.

### Notes
- Ensure your `.env` file is not committed to GitHub.
- Use the `.env.example` as a template for environment variables.
- For local development, create a `.env` file in the backend folder with the required variables.

Thank you for using BidWiser!
