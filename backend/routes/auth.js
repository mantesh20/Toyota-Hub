const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { body, validationResult } = require('express-validator');

router.post(
  '/signup',
  [
    body('username').isLength({ min: 2 }).withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({ ...req.body, password: hashedPassword });
      await user.save();
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'Server misconfigured' });
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
      res.status(201).json({ message: 'User registered', token });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Signup failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });

      // Update last login time and increment login count
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      
      // Check for loyalty status (5+ logins or bookings)
      const totalInteractions = (user.loginCount || 0) + (user.bookingCount || 0);
      if (totalInteractions >= 5 && !user.isLoyalCustomer) {
        user.isLoyalCustomer = true;
        user.loyaltyDiscount = 10; // 10% discount
        user.loyaltyGift = 'Toyota Premium Gift Set';
      }
      
      await user.save();

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'Server misconfigured' });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

module.exports = router;