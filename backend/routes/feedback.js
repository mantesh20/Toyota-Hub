const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Create feedback - No auth required for demo (but will use user if token exists)
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/feedback - Request received');
    // Try to get user from token if available, otherwise use null
    let userId = null;
    try {
      const header = req.headers['authorization'] || '';
      const [scheme, token] = header.split(' ');
      if (scheme === 'Bearer' && token) {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET;
        if (secret) {
          const payload = jwt.verify(token, secret);
          userId = payload.id;
        }
      }
    } catch (err) {
      // No valid token, continue without user
      console.log('No valid token for feedback, proceeding without user');
    }

    const feedback = new Feedback({
      ...req.body,
      user: userId || undefined
    });
    await feedback.save();
    console.log('Feedback saved successfully');
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    console.error('Error creating feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
  }
});

// Get all feedbacks - for manager dashboard (no auth for demo)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks', details: err.message });
  }
});

module.exports = router;

