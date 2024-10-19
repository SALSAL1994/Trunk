const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/users.model'); // Import User model
const router = express.Router();
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Create a unique file name
  }
});

const upload = multer({ storage: storage }); // Multer instance with diskStorage

const RequestModel = require('../models/request.model'); // Adjust path as needed

// ====================== Registration Route ======================
router.post('/signup', async (req, res) => {
  const { username, email, password, roles } = req.body;

  try {
    // Check if user already exists by email
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
      roles // Save the roles array (e.g. ['deliverer', 'requester'])
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// ====================== Login Route ======================
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

    // Store user session info
    req.session.user = {
      id: user._id,
      username: user.username,
      roles: user.roles,
    };

    // Send user details in response
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

// ====================== Request Submission Route ======================
// Adding 'upload.single' to handle file upload for productImage
router.post("/request", upload.single('productImage'), async (req, res) => {
  try {
    // Access the form data, including lat/lng for sender and recipient
    const {
      name,
      senderAddress,
      senderLat,
      senderLng,
      recipientAddress,
      recipientLat,
      recipientLng,
      productType,
      requestDate,
      requestTime,
      productSize
    } = req.body.newRequest;
    const productImage = req.file; // Access the uploaded file if available

    // Create a new request document, now including lat/lng
    const newRequest = new RequestModel({
      name,
      senderAddress,
      senderLat,
      senderLng,
      recipientAddress,
      recipientLat,
      recipientLng,
      productType,
      requestDate,
      requestTime,
      productSize,
      productImage: productImage ? productImage.filename : null // Store image name or path if available
    });

    // Save the request to the database
    const savedRequest = await newRequest.save();

    // Send success response with the saved data
    res.status(201).json({
      message: 'Request submitted successfully!',
      data: savedRequest
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error.message
    });
  }
});
module.exports = router;
