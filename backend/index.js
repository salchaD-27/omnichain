// npm install express cors dotenv jsonwebtoken date-fns pg
import express from 'express';
const app = express()
import cors from 'cors';
// const authjs = require('./routes/auth.js')
import api_wallet_siwe from './routes/api-wallet-siwe.js'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
dotenv.config()

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
// POST /api/auth/user
app.use('/api/auth', api_wallet_siwe)


app.listen(PORT, ()=>{console.log(`backend server running at http://localhost:${PORT}`)})