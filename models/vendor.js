// Require Mongoose
const mongoose = require('mongoose');

// Define User Schema
const vendorSchema = new mongoose.Schema({
  vendorid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // vendorid: { type: String },
  businessname: { type: String },
  businessdescription: { type: String },
  province: { type: String },
  city: { type: String },
  pincode: { type: String },
  businessImages: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: Date.now() },
});

// Define models
const User = mongoose.model('Vendor', vendorSchema);

module.exports = User;
