const express = require('express');
// import jwt from 'jsonwebtoken';
const { Pool } = require('pg');
const { randomBytes } = require('crypto');
const { addMinutes } = require('date-fns');
const { ethers } = require('ethers');
const { createAssetScript } = require('./utils/asset-create');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const router = express.Router()

router.post('/create', async (req, res) => {
    try{
        const sessionId = req.cookies?.session_id;
        if (!sessionId) return res.status(401).json({ error: 'Not authenticated' });
        const { rows } = await pool.query(
        'SELECT * FROM sessions WHERE session_id=$1 AND expires_at > NOW()',
        [sessionId]
        );
        if (rows.length === 0) return res.status(401).json({ error: 'Session expired' });
    
        const receipt = await createAssetScript();
        console.log('receipt: ', receipt);

        res.json({ 
            success: true, 
            message: 'Asset created successfully',
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
})

module.exports = router;
