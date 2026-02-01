// npm install express cors dotenv jsonwebtoken date-fns pg
const express = require('express');
const app = express()
const cors = require('cors');
const api_auth = require('./routes/api-auth.js');
const api_asset = require('./routes/api-asset.js');
const cookieParser = require('cookie-parser');
require('dotenv').config()

// frontend - localhost:3000
// backend - localhost:3001
const PORT = process.env.PORT || 3001;

// allowing reqs from frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // if using cookies or auth headers
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
// allowing all origins during development
// app.use(cors());

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// POST /api/auth -> auth.js (user auth login)
// app.use('/api/auth', authjs)
// POST /api/refresh-token -> refresh-token.js
// app.use('/api/refresh-token', refreshtokenjs)

// POST /api/auth/nonce-record
// POST /api/auth/verify-sign
// GET /api/auth/user
// POST /api/auth/logout
app.use('/api/auth', api_auth)
// POST /api/asset/create
// POST /api/asset/get
// GET /api/asset/get-all
app.use('/api/asset', api_asset)


app.listen(PORT, ()=>{console.log(`backend server running at http://localhost:${PORT}`)})