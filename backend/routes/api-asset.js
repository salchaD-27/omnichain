const express = require('express');
// import jwt from 'jsonwebtoken';
const { Pool } = require('pg');
const { randomBytes } = require('crypto');
const { addMinutes } = require('date-fns');
const { ethers } = require('ethers');
const multer = require("multer");
const { createAssetScript } = require('./utils/asset-create');
const { getAssetsScript } = require('./utils/asset-get');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const router = express.Router()

const uploadIcon = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/create', uploadIcon.single("icon"), async (req, res) => {
    try{
        const sessionId = req.cookies?.session_id;
        if (!sessionId) return res.status(401).json({ error: 'Not authenticated' });
        const { rows } = await pool.query('SELECT * FROM sessions WHERE session_id=$1 AND expires_at > NOW()', [sessionId]);
        if (rows.length === 0) return res.status(401).json({ error: 'Session expired' });

        const { name, description, color } = req.body;
        const icon = req.file;
        console.log(req.body, icon);
        if (!icon) {return res.status(400).json({ error: "Icon file missing" });}
        const receipt = await createAssetScript(name, description, color, icon.buffer);

        res.json({ 
            success: true, 
            message: 'Asset created successfully',
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
})

router.post('/get', async (req, res)=>{
    try{
        const sessionId = req.cookies?.session_id;
        if(!sessionId) return res.status(401).json({error: 'Not authenticated'});
        const { rows } = await pool.query('SELECT * FROM sessions WHERE session_id=$1 AND expires_at > NOW()', [sessionId]);
        if (rows.length === 0) return res.status(401).json({ error: 'Session expired' });
        
        const {address} = req.body;
        const assets = await getAssetsScript(address);
        
        // Custom JSON serializer to handle BigInt
        const jsonStringify = (obj) => JSON.stringify(obj, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
        );
        
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStringify({
            success: true,
            assets: assets,
        }));
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Server error: ' + err.message});
    }
})

module.exports = router;
