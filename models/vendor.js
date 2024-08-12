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

const catalogueSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: [{ type: String }],
  price: {
    type: Number,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define models
const Catalogue = mongoose.model('Catalogue', catalogueSchema);

// Define models
const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = {
  Vendor,
  Catalogue,
};
