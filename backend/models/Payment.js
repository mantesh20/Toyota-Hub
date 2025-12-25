const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false
    },
    car: {
      model: { type: String, required: true },
      variant: { type: String },
      price: { type: Number, required: true }
    },
    // Loan details
    loanAmount: {
      type: Number,
      required: true
    },
    downPayment: {
      type: Number,
      required: true
    },
    emi: {
      type: Number,
      required: true
    },
    interestRate: {
      type: Number,
      required: true
    },
    loanTerm: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    // Bank details
    bankDetails: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      accountHolderName: { type: String, required: true }
    },
    // Payment method
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking'],
      required: true
    },
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    // Manager action
    managerAction: {
      type: String,
      enum: ['approved', 'rejected', null],
      default: null
    },
    managerNotes: {
      type: String,
      trim: true
    },
    // Delivery status
    deliveryStatus: {
      type: String,
      enum: ['pending', 'approved', 'in_transit', 'delivered'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      unique: true
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

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

