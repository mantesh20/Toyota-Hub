const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Middleware to check if user is a manager
const isManager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') return next();
  return res.status(403).json({ error: 'Access denied. Manager privileges required.' });
};

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Manager routes are working' });
});

// Get logged-in users (users with lastLogin set) - Allow without auth for demo
// This route must come BEFORE /users to avoid route matching conflicts
router.get('/users/logged-in', async (req, res) => {
  try {
    console.log('GET /api/manager/users/logged-in - Request received');
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

// Get all users (for manager dashboard) - Allow without auth for demo
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ lastLogin: -1, createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all test drive bookings - Allow without auth for demo
router.get('/bookings', async (req, res) => {
  try {
    console.log('GET /api/manager/bookings - Request received');
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
    console.log('GET /api/manager/messages - Request received');
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    console.log(`Found ${messages.length} contact messages`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

// Get all feedbacks - No auth required for demo
router.get('/feedbacks', async (req, res) => {
  try {
    console.log('GET /api/manager/feedbacks - Request received');
    const feedbacks = await Feedback.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    console.log(`Found ${feedbacks.length} feedbacks`);
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks', details: err.message });
  }
});

// Get dashboard statistics - Allow without auth for demo
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalBookings,
      totalMessages,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      ContactMessage.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
    ]);

    res.json({
      totalUsers,
      totalBookings,
      totalMessages,
      recentBookings,
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Update booking status
router.patch('/bookings/:id/status', auth, isManager, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Approve a test drive booking - No auth required for demo
router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    console.log(`Approving booking ${req.params.id}`);
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        managerAction: 'approved',
        managerNotes: req.body.notes || 'Approved by manager'
      },
      { new: true }
    ).populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log(`Booking ${req.params.id} approved successfully`);
    res.json(booking);
  } catch (err) {
    console.error('Error approving booking:', err);
    res.status(500).json({ error: 'Failed to approve booking', details: err.message });
  }
});

// Reject a test drive booking - No auth required for demo
router.patch('/bookings/:id/reject', async (req, res) => {
  try {
    console.log(`Rejecting booking ${req.params.id}`);
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        managerAction: 'rejected',
        managerNotes: req.body.notes || 'Rejected by manager'
      },
      { new: true }
    ).populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log(`Booking ${req.params.id} rejected successfully`);
    res.json(booking);
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).json({ error: 'Failed to reject booking', details: err.message });
  }
});

// Delete a user (soft delete)
router.delete('/users/:id', auth, isManager, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;
