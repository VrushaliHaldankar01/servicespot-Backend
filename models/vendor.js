// // Require Mongoose
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessname: { type: String },
  businessdescription: { type: String },
  province: { type: String },
  city: { type: String },
  postalcode: { type: String },
  businessnumber: { type: String },
  businessImages: [{ type: String }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
  },
  status: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: Date.now() },
});

// Define models
const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
