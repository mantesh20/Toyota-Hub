const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// POST /api/contact - create a contact message
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 5 }).withMessage('Message must be at least 5 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, message } = req.body;
      const doc = await ContactMessage.create({ name, email, message });
      return res.status(201).json({ message: 'Thank you! We will get back to you soon.', id: doc._id });
    } catch (err) {
      console.error('Contact create error:', err);
      return res.status(500).json({ error: 'Failed to submit message' });
    }
  }
);

// GET /api/contact - list messages (no auth for demo)
router.get('/', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

module.exports = router;
