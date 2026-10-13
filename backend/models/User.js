const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Google login walon ke paas password nahi hoga
  authProvider: { type: String, default: 'email' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);