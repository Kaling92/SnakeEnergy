const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_OUROBOROS_KEY';

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash user passwords safely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a random mock EVM crypto-wallet address anchor string 
    const randomHex = [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const generatedAddress = `0x${randomHex.substring(0, 5)}...${randomHex.substring(35, 40)}`;

    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      walletAddress: generatedAddress
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Sign a stable authentication tracking session token payload
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      success: true, 
      token,
      walletAddress: user.walletAddress 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;