const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    // Transform the request body to match the booking schema
    const bookingData = {
      user: req.user.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location || 'Not specified',
      preferredDate: req.body.date ? new Date(req.body.date) : (req.body.preferredDate ? new Date(req.body.preferredDate) : new Date()),
      preferredTime: req.body.time || req.body.preferredTime || '10:00',
      car: typeof req.body.car === 'string' 
        ? { model: req.body.car } 
        : (req.body.car || { model: 'Not specified' }),
      status: 'pending'
    };

    const booking = new Booking(bookingData);
    await booking.save();
    
    // Update user booking count and check loyalty
    const user = await User.findById(req.user.id);
    if (user) {
      user.bookingCount = (user.bookingCount || 0) + 1;
      const totalInteractions = (user.loginCount || 0) + (user.bookingCount || 0);
      if (totalInteractions >= 5 && !user.isLoyalCustomer) {
        user.isLoyalCustomer = true;
        user.loyaltyDiscount = 10; // 10% discount
        user.loyaltyGift = 'Toyota Premium Gift Set';
      }
      await user.save();
    }
    
    res.status(201).json({ message: 'Booking saved successfully', booking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to save booking', details: err.message });
  }
});

// Protected: List all bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Protected: Get booking by id
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Protected: Update booking
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Protected: Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;