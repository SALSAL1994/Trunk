const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/users.model'); // Import User model

const router = express.Router();

// Registration route
router.post('/signup', async (req, res) => {
  const { username, email, password, roles } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password before saving the user
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    roles  // Save the roles array (e.g. ['deliverer', 'requester'])
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});



router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      roles: user.roles,
    };

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



module.exports = router;
