const express = require('express');
// import jwt from 'jsonwebtoken';
const { Pool } = require('pg');
const { randomBytes } = require('crypto');
const { addMinutes } = require('date-fns');
const { ethers } = require('ethers');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const router = express.Router()

const onetime = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nonce_records (
        id SERIAL PRIMARY KEY,
        address TEXT NOT NULL,
        nonce TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          address TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('nonce_records and sessions table ensured');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}
onetime().catch(console.error);

async function insertNonceRecord({address, nonce, expiresAt, used}){
    const query = `
        INSERT INTO nonce_records (address, nonce, expires_at, used)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `
    const values = [address, nonce, expiresAt, used];
    const { rows } = await pool.query(query, values);
    // return rows[0];
}

function generateSessionId() {
  return randomBytes(32).toString('hex'); // 64-character opaque ID
}


router.post('/nonce-record', async (req, res)=>{
    const { address } = req.body;
    const nonce = randomBytes(16).toString('hex');
    const expiresAt = addMinutes(new Date(), 7); // Expiration (short-lived, 7 minutes)
    await insertNonceRecord({address, nonce, expiresAt, used: false});

    res.status(200).json({
      nonce,
      expiresAt: expiresAt.toISOString(),
      used: false,
    });
});

router.post('/verify-sign', async (req, res)=>{
  try{
    const { address, nonce, siweMsg, signature } = req.body;
    if (!address || !siweMsg || !signature) {return res.status(400).json({ error: 'Missing Parameters' });}

    const recorveredAddress = await ethers.verifyMessage(siweMsg, signature);
    if(recorveredAddress.toLocaleLowerCase() !== address.toLocaleLowerCase()){return res.status(400).json({ error: 'Invalid Signature' });}
    const { rows } = await pool.query(
      'SELECT * FROM nonce_records WHERE address=$1 AND nonce=$2 AND used=false AND expires_at > NOW()',
      [address, nonce]
    );
    if (rows.length === 0) {return res.status(400).json({ error: 'Invalid or expired nonce' });}

    await pool.query(
      'UPDATE nonce_records SET used=true WHERE id=$1',
      [rows[0].id]
    );

    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour session
    await pool.query(
      'INSERT INTO sessions (session_id, address, expires_at) VALUES ($1, $2, $3)',
      [sessionId, address, expiresAt]
    );

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      expires: expiresAt,
    })

    res.json({
      success: true,
      message: 'SIWE verified, session created'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user', async (req, res) => {
  try {
    const sessionId = req.cookies?.session_id;
    if (!sessionId) return res.status(401).json({ error: 'Not authenticated' });
    const { rows } = await pool.query(
      'SELECT * FROM sessions WHERE session_id=$1 AND expires_at > NOW()',
      [sessionId]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Session expired' });
    res.json({ address: rows[0].address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', async (req,res) => {
  try {
    const sessionId = req.cookies?.session_id;
    if (sessionId) {
      await pool.query('DELETE FROM sessions WHERE session_id=$1', [sessionId]);
      res.clearCookie('session_id');
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
})

module.exports = router;
