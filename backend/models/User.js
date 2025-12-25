const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'manager'], 
      default: 'user' 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String },
    loginCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    isLoyalCustomer: { type: Boolean, default: false },
    loyaltyDiscount: { type: Number, default: 0 },
    loyaltyGift: { type: String, default: '' }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('User', userSchema);