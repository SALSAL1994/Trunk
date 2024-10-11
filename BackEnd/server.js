const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose"); // Add mongoose
const authRoutes = require('./routes/auth.routes');


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
app.post("/", (req, res) => {
  res.json({ message: "trunk." });
});

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
