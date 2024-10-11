const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ['requester'] }  // Default to "requester"
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
