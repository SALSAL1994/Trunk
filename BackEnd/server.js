const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose"); // Add mongoose
const authRoutes = require('./routes/auth.routes');
const User = require('./models/users.model'); // Import User model
const bcrypt = require("bcrypt"); // Import bcrypt

require('dotenv').config(); // Load environment variables

const app = express(); // Define app here

var corsOptions = {
  origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas.");
  })
  .catch((err) => {
    console.error("Connection error:", err.message); // Log error message
    process.exit(1); // Exit the process with a failure code
  });

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);

// Use the auth routes for user registration
app.use('/api/auth', authRoutes);

// Simple route
app.post("/register", async (req, res) => {
  const { username, email, password, roles } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles: roles || [], // Assign roles if provided
    });

    // Save the user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.post("/signout", (req, res) => {
  req.session = null; // Clear the session
  res.status(200).json({ message: "You've been signed out!" });
});
// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
