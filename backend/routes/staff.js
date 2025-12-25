const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Staff routes are working' });
});

// Get logged-in users (users with lastLogin set) - No auth required for demo
router.get('/users/logged-in', async (req, res) => {
  try {
    console.log('GET /api/staff/users/logged-in - Request received');
    const loggedInUsers = await User.find({ lastLogin: { $exists: true, $ne: null } })
      .select('-password')
      .sort({ lastLogin: -1 });
    console.log(`Found ${loggedInUsers.length} logged-in users`);
    res.json(loggedInUsers);
  } catch (err) {
    console.error('Error fetching logged-in users:', err);
    res.status(500).json({ error: 'Failed to fetch logged-in users', details: err.message });
  }
});

// Get all test drive bookings - No auth required for demo
router.get('/bookings', async (req, res) => {
  try {
    console.log('GET /api/staff/bookings - Request received');
    const bookings = await Booking.find()
      .populate('user', 'username email phone lastLogin')
      .sort({ createdAt: -1 });
    console.log(`Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Get all contact messages - No auth required for demo
router.get('/messages', async (req, res) => {
  try {
    console.log('GET /api/staff/messages - Request received');
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    console.log(`Found ${messages.length} contact messages`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

module.exports = router;

