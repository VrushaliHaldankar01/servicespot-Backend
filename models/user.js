// Require Mongoose
const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phonenumber: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: Date.now() },
});
userSchema.index({ email: 1, role: 1 }, { unique: true });
// Define models
const User = mongoose.model('User', userSchema);

module.exports = User;
