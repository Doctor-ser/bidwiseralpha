# Deployment TODO

## 1. Secure the Code
- [x] Update backend/server.js to use environment variables
- [x] Create backend/.env.example
- [x] Update README.md with deployment instructions

## 2. Push Changes to GitHub
- [ ] Commit and push the updated code to bidwiseralpha repo

## 3. Deploy Backend to Render
- [ ] Go to render.com, create account if needed
- [ ] Connect GitHub repo
- [ ] Create new Web Service for backend
- [ ] Set build command: npm install
- [ ] Set start command: npm start
- [ ] Add environment variables: MONGO_URI, EMAIL_USER, EMAIL_PASS, FRONTEND_URL
- [ ] Deploy

## 4. Deploy Frontend to Vercel
- [ ] Go to vercel.com, create account if needed
- [ ] Connect GitHub repo
- [ ] Deploy the root directory (React app)
- [ ] Set build command: npm run build
- [ ] Get the deployed URL

## 5. Update Backend CORS
- [ ] Update FRONTEND_URL env var in Render with Vercel URL
- [ ] Redeploy backend

## 6. Test
- [ ] Test the live site
