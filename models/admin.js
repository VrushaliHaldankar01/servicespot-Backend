const { required } = require('joi');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  categoryImage: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: Date.now() },
});

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: Date.now() },
});

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = {
  Category,
  Subcategory,
};
