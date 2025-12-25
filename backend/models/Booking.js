const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true 
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true 
    },
    car: { 
      model: { type: String, required: true, trim: true },
      variant: { type: String, trim: true },
      year: { type: Number },
      price: { type: Number }
    },
    preferredDate: { 
      type: Date, 
      required: true 
    },
    preferredTime: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    managerAction: {
      type: String,
      enum: ['approved', 'rejected', null],
      default: null
    },
    managerNotes: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ preferredDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);