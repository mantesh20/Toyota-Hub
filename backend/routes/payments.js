const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Create payment request - No auth required for demo (but will use user if token exists)
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/payments - Request received');
    
    // Try to get user from token if available
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
      console.log('No valid token for payment, proceeding without user');
    }
    
    // Generate unique transaction ID
    const transactionId = 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const paymentData = {
      ...req.body,
      user: userId || req.body.user || null,
      transactionId,
      status: 'pending'
    };

    const payment = new Payment(paymentData);
    await payment.save();
    
    console.log('Payment request created successfully:', transactionId);
    res.status(201).json({ 
      message: 'Payment request submitted. Waiting for manager approval.', 
      payment,
      transactionId
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Failed to submit payment', details: err.message });
  }
});

// Get all payments - No auth required for demo
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/payments - Request received');
    const payments = await Payment.find()
      .populate('user', 'username email phone')
      .populate('booking', 'name email phone car location preferredDate preferredTime')
      .sort({ createdAt: -1 });
    console.log(`Found ${payments.length} payments`);
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'username email phone')
      .populate('booking', 'name email phone car location preferredDate preferredTime');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: 'Failed to fetch payment', details: err.message });
  }
});

// Approve payment - No auth required for demo
router.patch('/:id/approve', async (req, res) => {
  try {
    console.log(`Approving payment ${req.params.id}`);
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        managerAction: 'approved',
        managerNotes: req.body.notes || 'Payment approved by manager'
      },
      { new: true }
    ).populate('user', 'username email phone')
     .populate('booking', 'name email phone car location');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update booking status to confirmed if booking exists
    if (payment.booking && payment.booking._id) {
      await Booking.findByIdAndUpdate(payment.booking._id, { status: 'confirmed' });
    }

    console.log(`Payment ${req.params.id} approved successfully`);
    res.json(payment);
  } catch (err) {
    console.error('Error approving payment:', err);
    res.status(500).json({ error: 'Failed to approve payment', details: err.message });
  }
});

// Reject payment - No auth required for demo
router.patch('/:id/reject', async (req, res) => {
  try {
    console.log(`Rejecting payment ${req.params.id}`);
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        managerAction: 'rejected',
        managerNotes: req.body.notes || 'Payment rejected by manager'
      },
      { new: true }
    ).populate('user', 'username email phone')
     .populate('booking', 'name email phone car location');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log(`Payment ${req.params.id} rejected successfully`);
    res.json(payment);
  } catch (err) {
    console.error('Error rejecting payment:', err);
    res.status(500).json({ error: 'Failed to reject payment', details: err.message });
  }
});

// Approve delivery - No auth required for demo
router.patch('/:id/delivery', async (req, res) => {
  try {
    console.log(`Updating delivery status for payment ${req.params.id}`);
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        deliveryStatus: req.body.deliveryStatus || 'approved',
        status: req.body.deliveryStatus === 'delivered' ? 'completed' : payment.status
      },
      { new: true }
    ).populate('user', 'username email phone')
     .populate('booking', 'name email phone car location');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log(`Delivery status updated for payment ${req.params.id}`);
    res.json(payment);
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).json({ error: 'Failed to update delivery status', details: err.message });
  }
});

module.exports = router;

